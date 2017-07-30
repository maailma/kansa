import { Map } from 'immutable'

export const noAwardEntry = Map({ id: -1, 'no-award': true, title: 'No award' })

export const categories = [
  'Novel', 'Novella', 'Novelette', 'ShortStory', 'RelatedWork', 'GraphicStory',
  'DramaticLong', 'DramaticShort', 'EditorShort', 'EditorLong', 'ProArtist',
  'FanArtist', 'Semiprozine', 'Fanzine', 'Fancast', 'FanWriter', 'Series',
  'NewWriter'
]
