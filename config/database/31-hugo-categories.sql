SET ROLE hugo;

CREATE TYPE Category AS ENUM ('Novel', 'Novella', 'Novelette', 'ShortStory', 'RelatedWork',
    'GraphicStory', 'DramaticLong', 'DramaticShort', 'EditorLong', 'EditorShort', 'ProArtist',
    'Semiprozine', 'Fanzine', 'Fancast', 'FanWriter', 'FanArtist', 'Series', 'NewWriter');
