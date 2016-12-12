export const maxNominationsPerCategory = 5;

export const categoryInfo = {
  Novel: {
    title: 'Best Novel',
    description: `A science fiction or fantasy story of forty thousand (40,000) words or more.`,
    nominationFieldLabels: {
      title: 'Title',
      author: 'Author',
      publisher: 'Publisher/Where Published'
    }
  },

  Novella: {
    title: 'Best Novella',
    description: `A science fiction or fantasy story of between seventeen thousand five hundred (17,500) and forty thousand (40,000) words.`,
    nominationFieldLabels: {
      title: 'Title',
      author: 'Author',
      publisher: 'Publisher/Where Published'
    }
  },

  Novelette: {
    title: 'Best Novelette',
    description: `A science fiction or fantasy story of between seven thousand five hundred (7,500) and seventeen thousand five hundred (17,500) words.`,
    nominationFieldLabels: {
      title: 'Title',
      author: 'Author',
      publisher: 'Publisher/Where Published'
    }
  },

  ShortStory: {
    title: 'Best Short Story',
    description: `A science fiction or fantasy story of less than seven thousand five hundred (7,500) words.`,
    nominationFieldLabels: {
      title: 'Title',
      author: 'Author',
      publisher: 'Publisher/Where Published'
    }
  },

  RelatedWork: {
    title: 'Best Related Work',
    description: `Any work related to the field of science fiction, fantasy, or fandom, appearing for the first time during the previous calendar year or which has been substantially modified during the previous calendar year, and which is either non-fiction or, if fictional, is noteworthy primarily for aspects other than the fictional text, and which is not eligible in any other category.`,
    nominationFieldLabels: {
      title: 'Title',
      author: 'Author/Editor',
      publisher: 'Publisher/Where Published'
    }
  },

  GraphicStory: {
    title: 'Best Graphic Story',
    description: `Any science fiction or fantasy story told in graphic form appearing for the first time in the previous calendar year.`,
    nominationFieldLabels: {
      title: 'Title',
      author: 'Author',
      publisher: 'Publisher/Where Published'
    }
  },

  DramaticLong: {
    title: 'Best Dramatic Presentation, Long Form',
    description: `Any theatrical feature or other production, with a complete running time of more than 90 minutes, in any medium of dramatized science fiction, fantasy or related subjects that has been publicly presented for the first time in its present dramatic form during the previous calendar year.`,
    nominationFieldLabels: {
      title: 'Title',
      producer: 'Studio/Network/Production Company'
    }
  },

  DramaticShort: {
    title: 'Best Dramatic Presentation, Short Form',
    description: `Any television program or other production, with a complete running time of 90 minutes or less, in any medium of dramatized science fiction, fantasy or related subjects that has been publicly presented for the first time in its present dramatic form during the previous calendar year.`,
    nominationFieldLabels: {
      title: 'Title',
      series: '(Series)',
      producer: 'Studio/Network/Production Company'
    }
  },

  EditorShort: {
    title: 'Best Professional Editor, Short Form',
    description: `The editor of at least four (4) anthologies, collections or magazine issues (or their equivalent in other media) primarily devoted to science fiction and / or fantasy, at least one of which was published in the previous calendar year.`,
    nominationFieldLabels: {
      editor: 'Editor'
    }
  },

  EditorLong: {
    title: 'Best Professional Editor, Long Form',
    description: `The editor of at least four (4) novel-length works primarily devoted to science fiction and / or fantasy published in the previous calendar year that do not qualify as works under Best Editor, Shot Form.`,
    nominationFieldLabels: {
      editor: 'Editor'
    }
  },

  ProArtist: {
    title: 'Best Professional Artist',
    description: `An illustrator whose work has appeared in a professional publication in the field of science fiction or fantasy during the previous calendar year.`,
    nominationFieldLabels: {
      author: 'Artist/Illustrator',
      example: 'Example'
    }
  },

  Semiprozine: {
    title: 'Best Semiprozine',
    description: `Any generally available non-professional periodical publication devoted to science fiction or fantasy, or related subjects which by the close of the previous calendar year has published four (4) or more issues (or the equivalent in other media), at least one (1) of which appeared in the previous calendar year, which does not qualify as a fancast, and which in the previous calendar year met at least one (1) of the following criteria: (1) paid its contributors and/or staff in other than copies of the publication, (2) was generally available only for paid purchase.`,
    nominationFieldLabels: {
      title: 'Title'
    }
  },

  Fanzine: {
    title: 'Best Fanzine',
    description: `Any generally available non-professional periodical publication devoted to science fiction, fantasy, or related subjects that by the close of the previous calendar year has published four (4) or more issues (or the equivalent in other media), at least one (1) of which appeared in the previous calendar year, that does not qualify as a semiprozine or a fancast, and that in the previous calendar year met neither of the following criteria: (1) paid its contributors or staff monetarily in other than copies of the publication, (2) was generally available only for paid purchase.`,
    nominationFieldLabels: {
      title: 'Title'
    }
  },

  Fancast: {
    title: 'Best Fancast',
    description: `Any generally available non-professional audio or video periodical devoted to science fiction, fantasy, or related subjects that by the close of the previous calendar year has released four (4) or more episodes, at least one (1) of which appeared in the previous calendar year, and that does not qualify as a dramatic presentation.`,
    nominationFieldLabels: {
      title: 'Title'
    }
  },

  FanWriter: {
    title: 'Best Fan Writer',
    description: `Any person whose writing has appeared in semiprozines or fanzines or in generally available electronic media during the previous calendar year.`,
    nominationFieldLabels: {
      author: 'Author',
      example: 'Example'
    }
  },

  FanArtist: {
    title: 'Best Fan Artist',
    description: `An artist or cartoonist whose work has appeared through publication in semiprozines or fanzines or through other public, non-professional, display (including at a convention or conventions), during the previous calendar year.`,
    nominationFieldLabels: {
      author: 'Artist/Illustrator',
      example: 'Example'
    }
  },

  Series: {
    title: 'Best Series',
    description: `A multi-volume science fiction or fantasy story, unified by elements such as plot, characters, setting, and presentation, which has appeared in at least three (3) volumes consisting of a total of at least 240,000 words by the close of the calendar year 2016, at least one of which was published in 2016. If any series and a subset series thereof both receive sufficient nominations to appear on the final ballot, only the version which received more nominations shall appear.`,
    nominationFieldLabels: {
      title: 'Name of Series',
      author: 'Author',
      volume: 'Qualifying Volume',
      publisher: 'Publisher'
    }
  },

  NewWriter: {
    title: 'John W. Campbell Award',
    description: `Award for the best new science fiction writer, sponsored by Dell Magazines (not a Hugo Award). A new writer is one whose first work of science fiction or fantasy appeared in 2015 or 2016 in a professional publication. For Campbell Award purposes, a professional publication is one for which more than a nominal amount was paid, any publication that had an average press run of at least 10,000 copies, or any other criteria that the Award sponsors may designate.`,
    nominationFieldLabels: {
      author: 'Author',
      example: 'Example'
    }
  }
}

export const nominationFields = (categories) => {
  if (!Array.isArray(categories)) categories = [categories];
  const nf = {};
  categories.forEach(cat => {
    const texts = categoryInfo[cat];
    if (!texts) throw new Error('Unknown category ' + JSON.stringify(cat));
    for (const key in texts.nominationFieldLabels) nf[key] = true;
  });
  return Object.keys(nf);
}
