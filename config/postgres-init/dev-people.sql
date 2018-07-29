INSERT INTO admin.Admins (email, member_admin, member_list, siteselection, hugo_admin, raami_admin, admin_admin)
     VALUES ('admin@example.com', true, true, true, true, true, true),
            ('member-admin@example.com', true, false, false, false, false, false),
            ('site-select@example.com', false, false, true, false, false, false),
            ('hugo-admin@example.com', false, true, false, true, false, false);

SET ROLE kansa;

INSERT INTO People (legal_name, email, membership, member_number, hugo_nominator, hugo_voter)
     VALUES ('Admin', 'admin@example.com', 'NonMember', NULL, false, false),
            ('Member Admin', 'member-admin@example.com', 'NonMember', NULL, false, false),
            ('Site Selection', 'site-select@example.com', 'NonMember', NULL, false, false),
            ('Hugo Admin', 'hugo-admin@example.com', 'NonMember', NULL, false, false),
            ('First Member', 'member@example.com', 'FirstWorldcon', 2, true, true),
            ('Fan Parent', 'family@example.com', 'Adult', 3, true, true),
            ('Fan Child', 'family@example.com', 'Child', 4, false, false),
            ('Fan Youth', 'family@example.com', 'Youth', 5, true, true),
            ('Fan Supporter', 'supporter@example.com', 'Supporter', 6, true, true),
            ('Dupe Supporter', 'supporter@example.com', 'Supporter', 7, false, false),
            ('Fan Trader', 'trader@example.com', 'Exhibitor', 8, false, false),
            ('Fan Helper', 'helper@example.com', 'Helper', 9, false, false),
            ('Fan Nominator', 'nominator@example.com', 'NonMember', NULL, true, false);

INSERT INTO Keys
     VALUES ('admin@example.com', 'key'),
            ('member-admin@example.com', 'key'),
            ('site-select@example.com', 'key'),
            ('hugo-admin@example.com', 'key'),
            ('family@example.com', 'key'),
            ('member@example.com', 'key'),
            ('nominator@example.com', 'key'),
            ('trader@example.com', 'key'),
            ('helper@example.com', 'key'),
            ('supporter@example.com', 'key');

ALTER SEQUENCE member_number_seq RESTART WITH 42;
