export const categories = [ 'Novel', 'Novella', 'Novelette', 'ShortStory', 'RelatedWork',
    'GraphicStory', 'DramaticLong', 'DramaticShort', 'EditorLong', 'EditorShort', 'ProArtist',
    'Semiprozine', 'Fanzine', 'Fancast', 'FanWriter', 'FanArtist', 'Campbell' ];

export const nominationFields = (category) => { switch (category) {

  case 'Novel':
  case 'Novella':
  case 'Novelette':
  case 'ShortStory':
  case 'RelatedWork':
  case 'GraphicStory':
    return [ 'author', 'title', 'publisher' ];

  case 'DramaticLong':
  case 'DramaticShort':
    return [ 'title', 'set' ];

  case 'EditorLong':
  case 'EditorShort':
    return [ 'editor' ];

  case 'Semiprozine':
  case 'Fanzine':
  case 'Fancast':
    return [ 'title' ];

  case 'FanWriter':
  case 'FanArtist':
  case 'ProArtist':
  case 'Campbell':
    return [ 'author', 'example' ];

  default: throw new Error('Unknown category ' + JSON.stringify(category));
}};

