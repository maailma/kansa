INSERT INTO admin.Admins VALUES ('admin@example.com', true, true, true);

SET ROLE kansa;

INSERT INTO People (legal_name, email, membership, member_number, can_hugo_nominate, can_hugo_vote)
     VALUES ('Admin', 'admin@example.com', 'NonMember', NULL, false, false),
            ('First Member', 'member@example.com', 'FirstWorldcon', 21, true, true),
            ('Fan Parent', 'family@example.com', 'Adult', 37, true, true),
            ('Fan Child', 'family@example.com', 'Child', 45, false, false),
            ('Fan Youth', 'family@example.com', 'Youth', 59, true, true),
            ('Fan Supporter', 'supporter@example.com', 'Supporter', 68, true, true),
            ('Dupe Supporter', 'supporter@example.com', 'Supporter', 76, false, false),
            ('Fan Nominator', 'nominator@example.com', 'NonMember', NULL, true, false);

INSERT INTO Keys
     VALUES ('admin@example.com', 'key'),
            ('family@example.com', 'key'),
            ('member@example.com', 'key'),
            ('nominator@example.com', 'key'),
            ('supporter@example.com', 'key');

ALTER SEQUENCE member_number_seq RESTART WITH 42;
