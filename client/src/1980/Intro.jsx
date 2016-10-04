import React from 'react'

export default ({ setShowMore, showMore }) => <div>

  <p>
    Next year’s Hugo nominations will be the most complex ever, with six finalists for each award, a new tallying
    system, and a special category for Best Series. We are developing new software solutions for the Hugos – and we
    need to test them.
  </p>
  <p>
    We are therefore looking back as well as looking forward – and we are inviting fans to think themselves back to
    1979, and the SF and Fantasy of that year, for the purpose of giving us fresh data to test the software with.
    { showMore ? null : <a href="#more" style={{ paddingLeft: 8 }} onClick={ (ev) => {
      ev.preventDefault();
      setShowMore(true);
    } }>Read more...</a> }
  </p>

  { showMore ? <div>

    <h3>Why 1980?</h3>

    <p>
      This was, frankly, a fairly arbitrary decision. We wanted to choose a year which was not too far back in the
      mists of time, but also not so recent as to reopen unnecessary controversy.
    </p>
    <p>
      The 1980 Timewarp Project obviously doesn’t replace or in any way invalidate the real historic 1980 Hugo
      nominations, final ballot or winners – it just helps the Worldcon 75 Hugo administrators test the systems in
      advance of the 2017 nominations and vote. The <a
      href="http://www.thehugoawards.org/hugo-history/1980-hugo-awards/">Hugo Awards for 1980</a> were presented at
      Noreascon Two in Boston; those rewards remain part of history and will never be changed.
    </p>

    <h3>So what are you doing?</h3>

    <p>
      From 9 to 26 October, fans are invited to make nominations for the Hugo categories under the rules for 2017,
      but with respect to the state of the genre and fandom of 1979. Anyone can nominate, but only electronic
      nominations will be accepted.
    </p>
    <p>
      We will publish the full dataset of submitted nominations and the final Timewarp Ballot that would have
      emerged from those nominations if the current rules had been in force in 1980. We will not then proceed to any
      further vote – the Timewarp Ballot, and the dataset of nominations, are the end of the process. The released
      dataset will be stripped of all personally identifying data. Email addresses used to register for the project
      will be deleted from our systems at its conclusion.
    </p>

  </div> : null }

</div>;
