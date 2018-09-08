/**
 * @example
 * const ballots = [[1,2,3],[1,5,3,2],[2,1,3],[-1,2],[2,1,-1],[2],[3,2,1,-1],[],[5,5,5]]
 * const finalists = [1,2,3]
 *
 * countVotes(ballots,finalists)
 * // { rounds:
 * //    [ { tally:
 * //         [ { finalist: 2, votes: 3 },
 * //           { finalist: 1, votes: 2 },
 * //           { finalist: 3, votes: 1 },
 * //           { finalist: -1, votes: 1 } ],
 * //        totalWithPreference: 7,
 * //        minimumForMajority: 4,
 * //        winner: undefined,
 * //        eliminated: [ 3, -1 ] },
 * //      { tally: [ { finalist: 2, votes: 5 }, { finalist: 1, votes: 2 } ],
 * //        totalWithPreference: 7,
 * //        minimumForMajority: 4,
 * //        winner: 2 } ],
 * //   runoff: { wins: 6, losses: 1 },
 * //   winner: 2 }
 * ballots
 * // [ [ 1, 2, 3 ],
 * //   [ 1, 3, 2 ],
 * //   [ 2, 1, 3 ],
 * //   [ -1, 2 ],
 * //   [ 2, 1, -1 ],
 * //   [ 2 ],
 * //   [ 3, 2, 1, -1 ] ]
 */

const NO_AWARD = -1
const NO_PREFERENCE = 0

module.exports = countVotes

/**
 * Remove empty, no-preference & disqualified entries from ballots
 *
 * Modifies the input ballots array
 *
 * @param {number[][]} ballots
 * @param {number[]} finalists
 */
function cleanBallots(ballots, finalists) {
  for (let i = ballots.length - 1; i >= 0; --i) {
    const ballot = ballots[i]
    for (let j = ballot.length - 1; j >= 0; --j) {
      const choice = ballot[j]
      if (!choice) ballot.splice(j)
      // no-preference is null at this point
      else if (finalists.indexOf(choice) === -1) ballot.splice(j, 1)
    }
    if (ballot.length === 0) ballots.splice(i, 1)
  }
}

/**
 * Determine the current preference of a ballot
 *
 * @param {number[]} ballot
 * @param {number[]} eliminated
 * @returns {number} finalist
 */
function getPreference(ballot, eliminated) {
  for (let i = 0; i < ballot.length; ++i) {
    const choice = ballot[i]
    if (eliminated.indexOf(choice) === -1) {
      return choice
    }
  }
  return NO_PREFERENCE
}

/**
 * @typedef {Object} FinalistVotes
 * @property {number} finalist
 * @property {number} votes
 */

/**
 * Tally votes, returning current vote counts for each finalist
 *
 * @param {number[][]} ballots
 * @param {number[]} eliminated
 * @returns {FinalistVotes[]} sorted by vote count, from high to low
 */
function tallyVotes(ballots, eliminated) {
  const results = {}
  for (let i = 0; i < ballots.length; ++i) {
    const preference = getPreference(ballots[i], eliminated)
    if (preference !== NO_PREFERENCE) {
      if (results[preference]) results[preference] += 1
      else results[preference] = 1
    }
  }
  return Object.keys(results)
    .map(id => ({ finalist: Number(id), votes: results[id] }))
    .sort(({ votes: a }, { votes: b }) => (a < b ? 1 : a > b ? -1 : 0))
}

/**
 * Eliminate next finalist candidate(s)
 *
 * 6.4: Tallying of Votes. Votes shall first be tallied by the voter’s first
 * choices. If no majority is then obtained, the candidate who places last in
 * the initial tallying shall be eliminated and the ballots listing it as
 * first choice shall be redistributed on the basis of those ballots’ second
 * choices. This process shall be repeated until a majority-vote winner is
 * obtained. If two or more candidates are tied for elimination during this
 * process, the candidate that received fewer first-place votes shall be
 * eliminated. If they are still tied, all the tied candidates shall be
 * eliminated together.
 *
 * @param {FinalistVotes[]} tally
 * @param {FinalistVotes[]} firstPlaceVotes
 * @returns {number[]} finalists to be eliminated
 */
function eliminateNextCandidates(tally, firstPlaceVotes) {
  if (tally.length === 0) return []
  const leastVotes = tally[tally.length - 1].votes
  const next = tally
    .filter(({ votes }) => votes === leastVotes)
    .map(({ finalist }) => finalist)
  if (next.length <= 1) return next
  const tiebreaker = firstPlaceVotes.filter(({ finalist }) =>
    next.includes(finalist)
  )
  const leastFirstPlaceVotes = tiebreaker[tiebreaker.length - 1].votes
  return tiebreaker
    .filter(({ votes }) => votes === leastFirstPlaceVotes)
    .map(({ finalist }) => finalist)
}

/**
 * @typedef {Object} RoundResults
 * @property {FinalistVotes[]} tally
 * @property {number} totalWithPreference
 * @property {number} minimumForMajority
 * @property {number|undefined} winner Finalist
 * @property {number[]|undefined} eliminated
 */

/**
 * Run next round of vote counting
 *
 * @param {number[][]} ballots
 * @param {number[]} eliminated
 * @returns {RoundResults}
 */
function getNextRound(ballots, eliminated) {
  const tally = tallyVotes(ballots, eliminated)
  const totalWithPreference = tally.reduce((sum, { votes }) => sum + votes, 0)
  const minimumForMajority = Math.floor(totalWithPreference / 2) + 1
  const winner =
    tally.length > 0 && tally[0].votes >= minimumForMajority
      ? tally[0].finalist
      : undefined
  return { tally, totalWithPreference, minimumForMajority, winner }
}

/**
 * @typedef {Object} RunoffResults
 * @property {number} wins
 * @property {number} losses
 */

/**
 * Test winner against runoff candidate (no award)
 *
 * 3.12.3: “No Award” shall be the run-off candidate for the purposes of
 * Section 6.5.
 *
 * 6.5: Run-off. After a tentative winner is determined, then unless the
 * run-off candidate shall be the sole winner, the following additional test
 * shall be made. If the number of ballots preferring the run-off candidate to
 * the tentative winner is greater than the number of ballots preferring the
 * tentative winner to the run-off candidate, then the run-off candidate shall
 * be declared the winner of the election.
 *
 * BM-2013-01
 * In administering Constitution Section 6.5, a ballot should be counted if it
 * has a vote for either the tentative winner or the run-off candidate or for
 * both.
 *
 * @param {number[][]} ballots
 * @param {number} finalist
 * @returns {RunoffResults|null}
 */
function runoffTest(ballots, finalist) {
  if (!finalist || finalist === NO_AWARD) return undefined
  let wins = 0
  let losses = 0
  for (let i = 0; i < ballots.length; ++i) {
    const ballot = ballots[i]
    if (!ballot) continue
    const fi = ballot.indexOf(finalist)
    const ni = ballot.indexOf(NO_AWARD)
    if (fi === -1) {
      if (ni !== -1) ++losses
    } else {
      if (ni === -1 || ni > fi) ++wins
      else ++losses
    }
  }
  return { wins, losses }
}

/**
 * @typedef {Object} VoteCountResults
 * @property {RoundResults[]} rounds
 * @property {RunoffResults|undefined} runoff
 * @property {number} winner
 */

/**
 * Count votes for finalists
 *
 * @param {number[][]} ballots
 * @param {number[]} finalists
 * @returns {object<string, number>}
 */
function countVotes(ballots, finalists) {
  const rounds = []
  if (finalists.indexOf(NO_AWARD) === -1) finalists.push(NO_AWARD)
  cleanBallots(ballots, finalists)
  const eliminated = []
  let firstPlaceVotes = null
  do {
    const round = getNextRound(ballots, eliminated)
    rounds.push(round)
    if (round.winner || round.totalWithPreference === 0) break
    if (!firstPlaceVotes) firstPlaceVotes = round.tally
    round.eliminated = eliminateNextCandidates(round.tally, firstPlaceVotes)
    eliminated.push.apply(eliminated, round.eliminated)
    firstPlaceVotes = firstPlaceVotes.filter(
      ({ finalist }) => eliminated.indexOf(finalist) === -1
    )
  } while (eliminated.length > 0 && eliminated.length < finalists.length)
  let winner = rounds[rounds.length - 1].winner
  const runoff = runoffTest(ballots, winner)
  if (runoff && runoff.losses > runoff.wins) winner = NO_AWARD
  return { rounds, runoff, winner }
}
