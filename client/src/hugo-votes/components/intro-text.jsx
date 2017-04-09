import React from 'react'
import { CardActions, CardHeader, CardText } from 'material-ui/Card'

const VoteIntroText = () => (
  <CardText className="vote-intro" style={{ padding: '16px 32px' }}>
    <h3>
      Thank you for participating in the 2017 Hugo Awards and the John W. Campbell Award!
    </h3>

    <p>
      The Hugo Award is the leading award for excellence in the field of science fiction and fantasy. The Hugo Awards
      are awarded each year by the World Science Fiction Society (“WSFS”), at the World Science Fiction Convention
      (“Worldcon”). The finalists for the 2017 Hugo Awards and John W. Campbell Award for Best New Writer were
      announced on Tuesday 4 April 2017.
    </p>
    <p>
      The Hugo Awards will be presented at a formal ceremony on Friday 11 August 2017, at Worldcon 75, the 75th World
      Science Fiction Convention, in Helsinki, Finland. We currently plan to continue the recent tradition of
      streaming the ceremony live via the Internet, enabling fans around the world to experience the event.
    </p>
    <p>
      The official website of the Hugo Awards is <a href="http://thehugoawards.org/" target="_blank">thehugoawards.org</a>,
      where you can find the full history of the Hugo Awards as well as the names of past finalists and winners,
      information about the voting process, a gallery of past trophy designs, and more.
    </p>

    <h3>Deadline for Voting</h3>

    <p>
      The deadline for voting is Saturday 15 July 2017 at 11:59pm Pacific Daylight Time (2:59 am Eastern Daylight Time,
      07:59 British Summer Time, 09:59 in Finland, all on 16 July). Your ballot at that time will be your final vote.
    </p>

    <h3>How Votes are Counted</h3>

    <p>
      The Hugo Awards use an instant runoff ballot.  Rank the finalists in each category in order of preference: “1”
      for first place, “2” for second place, and so on.
    </p>
    <p>
      You are not required to rank all the finalists in any category, and we recommend avoid voting in any category
      where you are unfamiliar with most of the finalists. If you decide not to vote in any given category, leave it
      blank.
    </p>
    <p>
      Note that “No Award” is not an abstention; it means that none of the finalists should be given the award in
      question.
    </p>
    <p>
      When the ballots are counted, all the first place votes will be tabulated. If no finalist receives more than
      half the votes, the finalist with the fewest first place votes is eliminated and its votes are transferred to
      the finalists marked “2” on those ballots. This process of elimination continues until one finalist receives
      more than half the votes, at which point it becomes the winner (unless the votes are outnumbered by “No Award”
       votes under specific conditions described in Section 3.11 of the WSFS Constitution).
    </p>
    <p>
      Please note that second and further preferences play no part in the vote unless and until your first choice is
      eliminated. This is not a point system where the second choices of many voters can overwhelm the first choice
      of a few voters. We suggest that after marking your first choice, you proceed by imagining that it has
      disappeared from the ballot, and then give the second place to the next finalist you prefer, and so on. This
      mimics the way the ballots are actually counted. Thus, even if your heart is set on one finalist, don’t
      hesitate to give “2” (and other rankings) to other finalists you also consider worthy of the award.
    </p>
    <p>
      Choose all your preferences carefully! If your top choices are eliminated early, your lower preferences could
      be the tiebreaker between the remaining finalists. No matter how much you dislike a finalist, if you rank it,
      the vote will be counted if all your previous choices are eliminated.
    </p>

    <h3>How to Vote Online</h3>

    <ol>
      <li>Go to the category you wish to vote for.</li>
      <li>Choose the finalist you wish to rank.  When you select them, a box appears with all the numbers for possible rankings.</li>
      <li>Choose the ranking you wish to give to the finalist.</li>
      <li>The finalist will appear according to its ranking above the line. All unranked finalists appear below the line.</li>
    </ol>
    <p>
      If you change your mind on how the finalist should be ranked, you can either:
    </p>
    <ul>
      <li>Use the X to remove the ranking</li>
      <li>Choose the finalist again and change the numerical ranking.</li>
    </ul>
    <p>
      Another way to change the ranking:  If you rank a different finalist with the same number, the new ranking will
      take the place of the original. For example if Finalist A is ranked at 1, and you set Finalist B to 1, Finalist
      A will move to 2 in the ranking.
    </p>
    <p>
      You can make as many changes as you like up to your ballot until the deadline. Your changes are automatically
      saved. Your current ballot will be emailed to you 30 minutes after you finish modifying it.
    </p>
    <p>
      If you have questions regarding the ballot, please contact <a href="mailto:hugohelp@worldcon.fi">hugohelp@worldcon.fi</a>.
    </p>
  </CardText>
);

export default VoteIntroText;
