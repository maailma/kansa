import React from 'react'

export default ({ setShowMore, showMore }) => <div>

  <p>
    Next year’s Hugo nominations will be the most complex ever, with six finalists for each award, a
    new tallying system, and a special category for Best Series. We are developing new software
    solutions for the Hugos – and we need to test them.
  </p>
  <p>
    We are therefore looking back as well as looking forward – and we are inviting Worldcon 75 staff
    and friends to think themselves back to 1979, and the SF and Fantasy of that year, for the purpose
    of giving us fresh data to test the software with.
  </p>
  <p>
    In order to avoid any confusion about the purpose of the exercise - specifically, to avert any
    suggestion that this might be a re-do of the 1980 Hugos - we are not pushing the 1980 Timewarp
    Project on social media. At the same time feel free to quietly invite friends who are not on
    Worldcon 75 staff to participate.
  </p>

  <p>
    Please direct any comments or queries to <a
    href="mailto:timewarp-coordinators@worldcon.fi">timewarp-coordinators@worldcon.fi</a>.
  </p>

  { showMore ? <div>

    <h2>Why 1980?</h2>

    <p>
      This was, frankly, a fairly arbitrary decision. We wanted to choose a year which was not too far
      back in the mists of time, but also not so recent as to reopen unnecessary controversy. By
      fortunate coincidence, the full counting details from 1980, including the long lists, have been <a
      href="http://smofinfo.com/wsfs/Hugos/1980%20--%20Hugo%20voting%20details.pdf">preserved</a> so we
      can see what fans at the time nominated. (Of course there were different categories then - the
      soon-to-be-abandoned Gandalf Award, only one Dramatic Presentation category, only one Professional
      Editor category, “Non-Fiction” rather than “Related Work”, no Graphic Story, no Semiprozine, no
      Fancast, no Series.)
    </p>
    <p>
      The 1980 Timewarp Project obviously doesn’t replace or in any way invalidate the real historic 1980
      Hugo nominations, final ballot or winners – it just helps the Worldcon 75 Hugo administrators test
      the systems in advance of the 2017 nominations and vote. The <a
      href="http://www.thehugoawards.org/hugo-history/1980-hugo-awards/">Hugo Awards for 1980</a> were
      presented at Noreascon Two in Boston; those rewards remain part of history and will never be
      changed.
    </p>

    <h2>So what are you doing?</h2>

    <p>
      From 15 to 31 October, you are invited to make nominations for the Hugo categories under the rules
      for 2017, but with respect to the state of the genre and fandom of 1979. Anyone can nominate, but
      only electronic nominations will be accepted.
    </p>
    <p>
      We will publish the full dataset of submitted nominations (though without submitters’ names
      attached) and the final Timewarp Ballot that would have emerged from those nominations if the
      current rules had been in force in 1980. We will not then proceed to any further vote – the
      Timewarp Ballot, and the dataset of nominations, are the end of the process.
    </p>

  </div> : <a
    href="#more"
    style={{
      display: 'block',
      float: 'right'
    }}
    onClick={(ev) => {
      ev.preventDefault();
      setShowMore(true);
    }}
  >Read more...</a> }

</div>;
