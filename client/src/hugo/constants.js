export const maxNominationsPerCategory = 5;

export const categoryInfo = {
  Novel: {
    title: 'Best Novel',
    description: `If you had been nominating for the Hugos in 1980, what science fiction or fantasy story or stories of forty thousand (40,000) words or more, published for the first time in 1979, might you have nominated?`,
    nominationFieldLabels: {
      author: 'Author',
      title: 'Title',
      publisher: 'Publisher/Where Published'
    }
  },

  Novella: {
    title: 'Best Novella',
    description: `If you had been nominating for the Hugos in 1980, what science fiction or fantasy story or stories of between seventeen thousand five hundred (17,500) and forty thousand (40,000) words, published for the first time in 1979, might you have nominated?`,
    nominationFieldLabels: {
      author: 'Author',
      title: 'Title',
      publisher: 'Publisher/Where Published'
    }
  },

  Novelette: {
    title: 'Best Novelette',
    description: `If you had been nominating for the Hugos in 1980, what science fiction or fantasy story or stories of between seven thousand five hundred (7,500) and seventeen thousand five hundred (17,500) words, published for the first time in 1979, might you have nominated?`,
    nominationFieldLabels: {
      author: 'Author',
      title: 'Title',
      publisher: 'Publisher/Where Published'
    }
  },

  ShortStory: {
    title: 'Best Short Story',
    description: `If you had been nominating for the Hugos in 1980, what science fiction or fantasy story or stories of less than seven thousand five hundred (7,500) words, published for the first time in 1979, might you have nominated?`,
    nominationFieldLabels: {
      author: 'Author',
      title: 'Title',
      publisher: 'Publisher/Where Published'
    }
  },

  RelatedWork: {
    title: 'Best Related Work',
    description: `If you had been nominating for the Hugos in 1980, what work or works related to the field of science fiction, fantasy, or fandom, appearing for the first time or substantially modified in 1979, and either non-fiction or, if fictional, noteworthy primarily for aspects other than the fictional text, and also not eligible in any other category, might you have nominated?`,
    nominationFieldLabels: {
      author: 'Author/Editor',
      title: 'Title',
      publisher: 'Publisher/Where Published'
    }
  },

  GraphicStory: {
    title: 'Best Graphic Story',
    description: `If you had been nominating for the Hugos in 1980, what science fiction or fantasy story or stories told in graphic form, published for the first time in 1979, might you have nominated?`,
    nominationFieldLabels: {
      author: 'Author',
      title: 'Title',
      publisher: 'Publisher/Where Published'
    }
  },

  DramaticLong: {
    title: 'Best Dramatic Presentation, Long Form',
    description: `If you had been nominating for the Hugos in 1980, what theatrical feature(s) or other production(s), with a complete running time of more than 90 minutes, in any medium of dramatized science fiction, fantasy or related subjects, publicly presented for the first time in that form in 1979, might you have nominated?`,
    nominationFieldLabels: {
      title: 'Title',
      producer: 'Studio/Network/Production Company'
    }
  },

  DramaticShort: {
    title: 'Best Dramatic Presentation, Short Form',
    description: `If you had been nominating for the Hugos in 1980, what theatrical feature(s) or other production(s), with a complete running time of 90 minutes or less, in any medium of dramatized science fiction, fantasy or related subjects, publicly presented for the first time in that form in 1979, might you have nominated?`,
    nominationFieldLabels: {
      title: 'Title',
      series: '(Series)',
      producer: 'Studio/Network/Production Company'
    }
  },

  EditorShort: {
    title: 'Best Professional Editor, Short Form',
    description: `If you had been nominating for the Hugos in 1980, which editor or editors of at least four (4) anthologies, collections or magazine issues (or their equivalent in other media) primarily devoted to science fiction and / or fantasy, at least one of which was published in 1979, might you have nominated?`,
    nominationFieldLabels: {
      editor: 'Editor'
    }
  },

  EditorLong: {
    title: 'Best Professional Editor, Long Form',
    description: `If you had been nominating for the Hugos in 1980, which editor or editors of at least four (4) novel-length works (that do not qualify as works under Best Editor, Short Form) primarily devoted to science fiction and / or fantasy published in 1979 might you have nominated?`,
    nominationFieldLabels: {
      editor: 'Editor'
    }
  },

  ProArtist: {
    title: 'Best Professional Artist',
    description: `If you had been nominating for the Hugos in 1980, which illustrator or illustrators, whose work had appeared in a professional publication in the field of science fiction or fantasy in 1979, might you have nominated?`,
    nominationFieldLabels: {
      author: 'Artist/Illustrator',
      example: 'Example'
    }
  },

  Semiprozine: {
    title: 'Best Semiprozine',
    description: `If you had been nominating for the Hugos in 1980, what generally available non-professional periodical publication or publications, devoted to science fiction or fantasy, or related subjects which by 1979 had published four (4) or more issues (or the equivalent in other media), at least one (1) of which appeared in 1979, which did not qualify as a fancast, and which in 1979 met at least one (1) of the following criteria: (1) paid its contributors and/or staff in other than copies of the publication, (2) was generally available only for paid purchase, might you have nominated?`,
    nominationFieldLabels: {
      title: 'Title'
    }
  },

  Fanzine: {
    title: 'Best Fanzine',
    description: `If you had been nominating for the Hugos in 1980, what generally available non-professional periodical publication or publications, devoted to science fiction, fantasy, or related subjects that by 1979 had published four (4) or more issues (or the equivalent in other media), at least one (1) of which appeared in 1979, that did not qualify as a semiprozine or a fancast, and that in 1979 met neither of the following criteria: (1) paid its contributors or staff monetarily in other than copies of the publication, (2) was generally available only for paid purchase, might you have nominated?`,
    nominationFieldLabels: {
      title: 'Title'
    }
  },

  Fancast: {
    title: 'Best Fancast',
    description: `If you had been nominating for the Hugos in 1980, what generally available non-professional audio or video periodical or periodicals devoted to science fiction, fantasy, or related subjects that by 1979 had released four (4) or more episodes, at least one (1) of which appeared in 1979, and that did not qualify as a dramatic presentation, might you have nominated?`,
    nominationFieldLabels: {
      title: 'Title'
    }
  },

  FanWriter: {
    title: 'Best Fan Writer',
    description: `If you had been nominating for the Hugos in 1980, which person or persons whose writing appeared in semiprozines or fanzines or in generally available electronic media during 1979 might you have nominated?`,
    nominationFieldLabels: {
      author: 'Author',
      example: 'Example'
    }
  },

  FanArtist: {
    title: 'Best Fan Artist',
    description: `If you had been nominating for the Hugos in 1980, which artist(s) and/or cartoonist(s) whose work appeared through publication in semiprozines or fanzines or through other public, non-professional, display (including at a convention or conventions) during 1979 might you have nominated?`,
    nominationFieldLabels: {
      author: 'Artist/Illustrator',
      example: 'Example'
    }
  },

  Series: {
    title: 'Best Series',
    description: `If you had been nominating for the Hugos in 1980, which multi-volume science fiction or fantasy story or stories, unified by elements such as plot, characters, setting, and presentation, which had appeared in at least three (3) volumes consisting of a total of at least 240,000 words by 1979, at least one of which was published in 1979, might you have nominated?`,
    nominationFieldLabels: {
      author: 'Author',
      title: 'Title',
      publisher: 'Publisher'
    }
  },

  NewWriter: {
    title: 'Best New Writer',
    description: `If you had been nominating for the John W. Campbell Award for Best New Writer in 1980, which new writer or writers whose first work of science fiction or fantasy appeared in 1978 or 1979 in a professional publication might you have nominated?`,
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
