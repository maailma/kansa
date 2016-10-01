export const categories = [ 'Novel', 'Novella', 'Novelette', 'ShortStory', 'RelatedWork',
    'GraphicStory', 'DramaticLong', 'DramaticShort', 'EditorLong', 'EditorShort', 'ProArtist',
    'Semiprozine', 'Fanzine', 'Fancast', 'FanWriter', 'FanArtist', 'Campbell' ];

export const maxNominationsPerCategory = 5;

export const categoryTexts = {
  Novel: {
    title: 'Best Novel',
    description: 'A science fiction or fantasy story of 40,000 words or more, which appeared for the first time in 2016.',
    nominationFieldLabels: {
      author: 'Author',
      title: 'Title',
      publisher: 'Publisher'
    }
  },

  Novella: {
    title: 'Best Novella',
    description: 'A science fiction or fantasy story between 17,500 and 40,000 words, which appeared for the first time in 2016.',
    nominationFieldLabels: {
      author: 'Author',
      title: 'Title',
      publisher: 'Where Published'
    }
  },

  Novelette: {
    title: 'Best Novelette',
    description: 'A science fiction or fantasy story between 7,500 and 17,500 words, which appeared for the first time in 2016.',
    nominationFieldLabels: {
      author: 'Author',
      title: 'Title',
      publisher: 'Where Published'
    }
  },

  ShortStory: {
    title: 'Best Short Story',
    description: 'A science fiction or fantasy story of fewer than 7,500 words, which appeared for the first time in 2016.',
    nominationFieldLabels: {
      author: 'Author',
      title: 'Title',
      publisher: 'Where Published'
    }
  },

  RelatedWork: {
    title: 'Best Related Work',
    description: 'Any work related to the field of science fiction, fantasy, or fandom, appearing for the first time in 2016, or which has been substantially modified during 2016, and which is either non-fiction or, if fictional, is noteworthy primarily for aspects other than the fictional text, and which is not eligible in any other category.',
    nominationFieldLabels: {
      author: 'Author/Editor',
      title: 'Title',
      publisher: 'Publisher'
    }
  },

  GraphicStory: {
    title: 'Best Graphic Story',
    description: 'Any science fiction or fantasy story told in graphic form, appearing for the first time in 2016.',
    nominationFieldLabels: {
      author: 'Author',
      title: 'Title',
      publisher: 'Publisher'
    }
  },

  DramaticLong: {
    title: 'Best Dramatic Presentation, Long Form',
    description: 'Any theatrical feature or other production with a complete running time of more than 90 minutes, in any medium of dramatized science fiction, fantasy, or related subjects that has been publicly presented for the first time in its present dramatic form during 2016.',
    nominationFieldLabels: {
      title: 'Title',
      set: 'Studio/Series'
    }
  },

  DramaticShort: {
    title: 'Best Dramatic Presentation, Short Form',
    description: 'Any television program or other production with a complete running time of 90 minutes or less, in any medium of dramatized science fiction, fantasy, or related subjects that has been publicly presented for the first time in its present dramatic form during 2016.',
    nominationFieldLabels: {
      title: 'Title',
      set: 'Studio/Series'
    }
  },

  EditorShort: {
    title: 'Best Professional Editor, Short Form',
    description: 'The editor of at least four (4) anthologies, collections, or magazine issues (or their equivalent in other media) primarily devoted to science fiction and/or fantasy, at least one of which was published in 2016.',
    nominationFieldLabels: {
      editor: 'Editor'
    }
  },

  EditorLong: {
    title: 'Best Professional Editor, Long Form',
    description: 'The editor of at least four (4) novel-length works primarily devoted to science fiction and/or fantasy that were published in 2016, and do not qualify under Best Editor, Short Form.',
    nominationFieldLabels: {
      editor: 'Editor'
    }
  },

  ProArtist: {
    title: 'Best Professional Artist',
    description: 'An illustrator whose work has appeared in a professional publication in the field of science fiction or fantasy during 2016. A professional publication is one that meets at least one (1) of the following criteria: 1) It provided at least a quarter of the income of any one person; or 2) It was owned or published by any entity which provided at least a quarter of the income of any of its staff and/or owner. If possible, please cite an example of the nominee’s work. (Failure to provide such references will not invalidate a nomination.)',
    nominationFieldLabels: {
      author: 'Artist/Illustrator',
      example: 'Example'
    }
  },

  Semiprozine: {
    title: 'Best Semiprozine',
    description: 'Any generally available non-professional publication devoted to science fiction or fantasy which by the close of 2016 had published at least four (4) issues (or the equivalent in other media), and at least one (1) of which appeared in 2016, which does not qualify as a fancast, and which in 2016 has met at least one (1) of the following criteria: 1) Paid its contributors or staff in other than copies of the publication; or 2) Was generally available only for paid purchase.',
    nominationFieldLabels: {
      title: 'Title'
    }
  },

  Fanzine: {
    title: 'Best Fanzine',
    description: 'Any generally available non-professional publication devoted to science fiction, fantasy, or related subjects which, by the close of 2016, had published at least four (4) issues (or the equivalent in other media), at least one (1) of which appeared in 2016, and which does not qualify as a semiprozine or a fancast, and which in 2016 met neither of the following criteria: 1) Paid its contributors or staff in other than copies of the publication; or 2) Was generally available only for paid purchase.',
    nominationFieldLabels: {
      title: 'Title'
    }
  },

  Fancast: {
    title: 'Best Fancast',
    description: 'Any generally available non-professional audio or video periodical devoted to science fiction, fantasy, or related subjects that by the close of 2016 has released four (4) or more episodes, at least one (1) of which appeared in 2016, and that does not qualify as a dramatic presentation.',
    nominationFieldLabels: {
      title: 'Title'
    }
  },

  FanWriter: {
    title: 'Best Fan Writer',
    description: 'A person whose writing has appeared in fanzines or semiprozines, or in generally available electronic media in 2016.',
    nominationFieldLabels: {
      author: 'Author',
      example: 'Example'
    }
  },

  FanArtist: {
    title: 'Best Fan Artist',
    description: 'An artist or cartoonist whose work has appeared through publication in fanzines, semiprozines, or through any other public non-professional display (including at conventions) in 2016.',
    nominationFieldLabels: {
      author: 'Artist/Illustrator',
      example: 'Example'
    }
  },

  Campbell: {
    title: 'John W. Campbell Award',
    description: 'Award for the best new science fiction writer, sponsored by Dell Magazines (not a Hugo Award). A new writer is one whose first work of science fiction or fantasy appeared in 2015 or 2016 in a professional publication. For Campbell Award purposes, a professional publication is one for which more than a nominal amount was paid, any publication that had an average press run of at least 10,000 copies, or any other criteria that the Award sponsors may designate.',
    nominationFieldLabels: {
      author: 'Author',
      example: 'Example'
    }
  }
}

export const nominationFields = (category) => {
  const texts = categoryTexts[category];
  if (!texts) throw new Error('Unknown category ' + JSON.stringify(category));
  return Object.keys(texts.nominationFieldLabels);
}
