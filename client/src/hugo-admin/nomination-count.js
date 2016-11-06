/**
 * Select the Hugo Award finalists according to the WSFS constitution, as valid
 * for Worldcon 75 selecting the awards in 2017.
 *
 * Uses collections from immutable.js.
 *
 *
 * @typedef {Map<string, string>} Nomination
 *
 * @callback logger
 * @param {number} ballotCount
 * @param {number} nominationCount
 * @param {Iterable<Nomination>} nextEliminations
 */


import { List, Map, Seq } from 'immutable'

import { maxNominationsPerCategory } from '../hugo/constants';


/**
 * Count the number of uncanonicalised ballots that contain the specified
 * `nomination`
 *
 * @param {Iterable<Iterable<Nomination>>} rawBallots
 * @param {Nomination} nomination
 * @returns {number}
 */
export function countRawBallots(rawBallots, nomination) {
  return rawBallots.reduce((res, ballot) => {
    if (ballot.includes(nomination)) ++res;
    return res;
  }, 0);
}


/**
 * Canonicalise & simplify ballots, removing duplicates and empty nominations
 *
 * @param {string} category
 * @param {Map<string, Map<number, List<Nomination>>>} allBallots
 * @param {Map<string, List<Map<{ canon_id: number, data: Nomination }>>>} allNominations
 * @param {Map<canon_id, Nomination>} canon
 * @returns {List<Set<Nomination>>}
 */
export function cleanBallots(category, allBallots, allNominations, canon) {
  const ballots = allBallots.get(category).withMutations(ballots => {
    allNominations.forEach((nominations, cat) => {
      nominations.forEach(nomination => {
        const ci = nomination.get('canon_id');
        const cd = ci && canon.get(ci);
        if (cat === category) {
          const nd = nomination.get('data');
          if (cd) {
            if (cd.get('disqualified')) {
              // remove disqualified nomination
              ballots.forEach((ballot, id) => {
                if (ballot.includes(nd)) {
                  ballots.set(id, ballot.filter(nom => !nd.equals(nom)));
                }
              });
            } else {
              // canonicalise nomination within category
              ballots.forEach((ballot, id) => {
                if (ballot.includes(nd)) {
                  ballots.set(id, ballot.map(nom => nd.equals(nom) ? cd : nom));
                }
              });
            }
          } else if (ci) {
            // canonicalise nomination to another category
            ballots.forEach((ballot, id) => {
              if (ballot.includes(nd)) {
                ballots.set(id, ballot.filter(nom => !nd.equals(nom)));
              }
            });
          }
        } else if (cd && !cd.get('disqualified')) {
          // canonicalise nomination from another category
          const nd = nomination.get('data');
          allBallots.get(cat).forEach((srcBallot, id) => {
            if (srcBallot.includes(nd)) {
              const tgtBallot = ballots.get(id);
              if (!tgtBallot) {
                ballots.set(id, List.of(cd));
              } else if (tgtBallot.size < maxNominationsPerCategory) {
                ballots.set(id, tgtBallot.push(cd));
              } else {
                console.log(
                  `Dropping mis-nomination by #${id} due to full ballot`,
                  cd.toJS(), `from ${cat}`, srcBallot.toJS(),
                  `to ${category}`, tgtBallot.toJS()
                );
              }
            }
          });
        }
      });
    });
  });
  const emptyNom = Map();
  return ballots.toList().map(ballot => ballot.toSet().delete(emptyNom));
}


/**
 * Count the nominations and points for each nomination in `ballots`. In order
 * to avoid dealing with floating-point numbers, the function counts 60 points
 * as the total value of each ballot.
 *
 * This performs the Finalist Selection Process Calculation Phase:
 * > First, the total number of nominations (the number of ballots on which each
 * > nominee appears) from all eligible ballots shall be tallied for each
 * > remaining nominee. Next, a single “point” shall be assigned to each
 * > nomination ballot. That point shall be divided equally among all remaining
 * > nominees on that ballot. Finally, al l points from all nomination ballots
 * > shall be totaled for each nominee in that category. These two numbers,
 * > point total and number of nominations, shall be used in the Selection and
 * > Elimination Phases.
 *
 * @param {List<Set<Nomination>>} ballots
 * @returns {Map<Nomination, { nominations: number, points: number }>}
 */
function countNominations(ballots) {
  const pointsPerBallot = 60;  // divisible by 1..6
  return Map().withMutations(counts => {
    ballots.forEach(ballot => {
      if (ballot.size > 0) {
        const nomPoints = pointsPerBallot / ballot.size;
        ballot.forEach(nom => {
          const count = counts.get(nom);
          if (count) {
            count.nominations += 1;
            count.points += nomPoints;
          } else {
            counts.set(nom, { nominations: 1, points: nomPoints });
          }
        });
      }
    });
  });
}


/**
 * Select at least two entries of `counts` with the lowest point counts. If
 * `counts` is of size 2 or smaller, it is returned immediately.
 *
 * This performs the Finalist Selection Process Selection Phase:
 * > The two nominees with the lowest point totals shall be selected for
 * > comparison in the Elimination Phase. [If] two or more nominees are tied for
 * > the lowest point total, all such nominees shall be selected for the
 * > Elimination Phase. [If] one nominee has the lowest point total and two or
 * > more nominees are tied for the second-lowest point total, then all such
 * > nominees shall be selected for the Elimination Phase.
 *
 * @param {Map<Nomination, { nominations: number, points: number }>} counts
 * @returns {Map<Nomination, { nominations: number, points: number }>}
 */
function nominationsWithLeastPoints(counts) {
  if (counts.size <= 2) return counts;
  let ptLimit = counts.minBy(count => count.points).points;
  let selected = counts.filter(count => count.points === ptLimit);
  if (selected.size < 2) {
    ptLimit = counts.toSeq()
      .filter(count => count.points > ptLimit)
      .minBy(count => count.points)
      .points;
    selected = counts.filter(count => count.points <= ptLimit);
  }
  return selected;
}


/**
 * Select the entry or entries of `counts` with the least nominations and of
 * those, the entry or entries with the lowest point counts.
 *
 * This performs part of the Finalist Selection Process Elimination Phase:
 * > Nominees chosen in the Selection Phase shall be compared, and the nominee
 * > with the fewest number of nominations shall be eliminated and removed from
 * > all ballots for the Calculation Phase of all subsequent rounds. [If] two or
 * > more nominees are tied for the fewest number of nominations, the nominee
 * > with the lowest point total at that round shall be eliminated. [If] two or
 * > more nominees are tied for both fewest number of nominations and lowest
 * > point total, then all such nominees tied at that round shall be eliminated.
 *
 * @param {Map<Nomination, { nominations: number, points: number }>} counts
 * @returns {Map<Nomination, { nominations: number, points: number }>}
 */
function nominationsWithLeastNominations(counts) {
  const nomLimit = counts.minBy(count => count.nominations).nominations;
  let selected = counts.filter(count => count.nominations === nomLimit);
  if (selected.size > 1) {
    const ptLimit = selected.minBy(count => count.points).points;
    selected = selected.filter(count => count.points === ptLimit);
  }
  return selected;
}


/**
 * Select the nominations that would next be eliminated according to the
 * Selection and Elimination Phases of the Finalist Selection Process.
 *
 * @param {Map<Nomination, { nominations: number, points: number }>} counts
 * @returns {Seq.Indexed<Nomination>}
 */
function nominationsForElimination(counts) {
  const leastPoints = nominationsWithLeastPoints(counts);
  const leastNoms = nominationsWithLeastNominations(leastPoints);
  return leastNoms.keySeq();
}


/**
 * Select `numSelected` finalists from `ballots` of canonicalised nominations.
 * If the `log` callback function is set, it's called during each loop.
 *
 * May return `null` if `ballots` becomes empty, to indicate an error.
 *
 * @param {number} numSelected
 * @param {List<Set<Nomination>>} ballots
 * @param {logger} [log]
 * @returns {Iterable<Nomination> | null}
 */
export function selectFinalists(numSelected, ballots, log) {
  do {
    const counts = countNominations(ballots);
    const elimNoms = nominationsForElimination(counts);
    const nextSize = counts.size - elimNoms.size;
    if (log) log(ballots, counts, nextSize < numSelected ? Seq() : elimNoms);
    if (nextSize === numSelected) {
      return counts.keySeq().filterNot(nom => elimNoms.includes(nom));
    } else if (nextSize < numSelected) {
      return counts.keySeq();
    }
    ballots = ballots
      .map(ballot => ballot.filterNot(nom => elimNoms.includes(nom)))
      .filter(ballot => ballot.size);
  } while(ballots.size);
  return null;
}