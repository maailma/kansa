import React from 'react'
import Dialog from 'material-ui/Dialog'

export const BasicRules = () => <div>
  <h4>Location: Messukeskus, Hall 5</h4>

  <p>
    Hours: Opening hours of Worldcon 75 Exhibits hall (TBA), closing early on
    Sunday for auction.
  </p><p>
    To exhibit in the art show you must be a member of Worldcon 75. If you do
    not plan to attend and are sending your work to the show via a third party,
    you only need a supporting membership.
  </p><p>
    To view, bid, or purchase artwork, one must have an attending Worldcon 75
    membership.
  </p><p>
    We welcome all styles of original art by creators from all backgrounds
    within the auction gallery, the print shop, and the digital gallery. Subject
    matter should stay under the very broad umbrella of ‘science fiction,
    fantasy, horror, astronomical, fannish, or related themes’.
  </p><p>
    Worldcon 75 will reserve the right to leave out artworks or artists that
    fail to meet our quality standards or are otherwise unsuitable for the art
    show.
  </p><p>
    Wordcon 75 art show has three sections: the auction gallery, the print shop
    and the digital gallery. Artists are welcome to display work in any section
    of the art show or in all of them.
  </p><p>
    The auction gallery will contain works that may be available for purchase
    via written auction. <b>Please note that we will NOT be holding a live voice
    art auction, for reasons of language and logistics. The auction will be run
    on paper bid sheets only; please price your works accordingly.</b> Work in
    the auction gallery must be singular in that no other copies of that image
    or work may be on display in the same section, regardless of medium or size.
    NFS or “Not For Sale” work is allowed in the auction gallery, but we would
    appreciate it if at least half of your work is for sale. You may not enter
    works into the auction if they are also for sale in the print shop or the
    dealers room (but you may enter the original of a work for which you are
    selling prints in the print shop or the dealers room).
  </p><p>
    <b>Copyright</b><br/>
    All artworks must be created by the submitting artist. If the artwork is a
    product of collaboration with other artist(s) that must be clearly
    indicated when submitting said artwork to the art show. The Worldcon 75 art
    show does not accept art for resale.
  </p><p>
    <b>Reproduction Rights:</b><br/>
    Sale of an artwork does not include any reproduction rights. Buyers who
    wish to reproduce an artwork must make arrangements directly with the
    artist.
  </p><p>
    <b>Awards:</b><br/>
    Only work in the auction gallery or digital gallery (not the print shop),
    including NFS artwork, will be eligible for awards.
  </p><p>
    <b>Security (aka Turva):</b><br/>
    We expect to have marked guards inside the art show area at all times while
    the art show is open. All art leaving the art show area must be marked
    clearly as sold items and have a valid receipt. Unless purchased, artwork
    signed into the art show may not be withdrawn, nor may any conditions of
    its sale (e.g., minimum bid) be changed, for the duration of the
    show.
  </p><p>
    <b>Insurance:</b><br/>
    Worldcon75 cannot provide insurance coverage for art exhibited in the show,
    so you should ensure that your own insurance will cover your art while it
    is at the show.
  </p><p>
    <b>Display system:</b><br/>
    The art show will be built using Messukeskus’s own display wall system.
    Standard wall elements are made of white hardboard. Artwork items can be
    attached using adhesives, screws or nails. Size of wall element is 100 × 250
    cm. Therefore, the basic unit of space will be one square metre (m2) for
    both walls and tables.
  </p><p>
    The digital gallery will have an attending fee per artist, as it will only
    be for displaying artworks without the possibility to purchase any of
    them.
    <ul>
      <li>Auction gallery: €20 / m2, wall or table</li>
      <li>Print shop: €10 / m2, wall or table</li>
      <li>Digital gallery: €20 / artist (maximum 20 pictures/artist)</li>
    </ul>
  </p><p>
    <b>Mail-in artwork:</b><br/>
    space fee + return postage + €20. This also applies to attending artists
    mailing in their work. Due to the substantial effort required for our staff
    to store, unpack, hang, unhang, and re­pack mailed-in art, we will only
    allow a limited amount of it. Please do not request permission to mail your
    artwork unless you really are unable to find any other way to get it to and
    from the show. If we allow you to mail your art, you must pre­pay in full
    for return shipping. If you mail art to us without our prior written
    agreement, we will return it.
  </p><p>
    Worldcon 75 will take a 10% commission on all sales.
  </p><p>
    <b>Presentation:</b><br/>
    All two-dimensional (flat) entries in the auction gallery must be matted,
    mounted, or framed, and ready to be hung. Three-dimensional work must
    likewise be display-ready. Work in the printshop must be mounted or matted;
    clearbags or sleeves are recommended as a protective measure but not
    required. The art show will not be liable for damage as a result of
    inadequate preparation.
  </p><p>
    All items to be entered in any section of the art show must be finished
    before being put on display. All artwork in the main gallery and the print
    shop must be clearly and individually labeled with the title and the
    artist’s name(s). Title and artist name must also be provided for digital
    gallery works so that they can be appropriately displayed.
  </p><p>
    <b>Payment:</b><br/>
    Worldcon 75 will pay artists for sales of works within 45 days of the end
    of the convention.
  </p><p>
    <b>Cancellations:</b><br/>
    We will refund your fees in full if you cancel your art show booking by
    15th July 2017. Refund after this point is dependent on us being able to
    re-sell the space, and we reserve the right to charge a fee for late
    cancellations.
  </p><p>
    <b>Disclaimer:</b><br/>
    While we fully intend these to be the policies that actually govern the
    Worldcon 75 art show, we reserve the right to make changes or
    interpretations if unforeseen circumstances arise or for accessibility
    reasons. Any such decisions will be guided by the spirit, rather than the
    letter, of these policies.
  </p>
</div>;

export class BasicRulesDialog extends React.Component {

  state = { open: false };

  render() {
    return <span>
      {React.Children.map(
        this.props.children,
        (child) => React.cloneElement(child, {
          onTouchTap: () => this.setState({ open: true })
        })
      )}
      <Dialog
        autoScrollBodyContent={true}
        modal={false}
        onRequestClose={() => this.setState({ open: false })}
        open={this.state.open}
        title="Worldcon 75 Art Show Basic Rules"
      >
        <BasicRules />
      </Dialog>
    </span>;
  }
}
