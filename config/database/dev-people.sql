INSERT INTO admin.Admins (email, member_admin, member_list, siteselection, hugo_admin, raami_admin, admin_admin)
     VALUES ('admin@example.com', true, true, false, true, true, true),
            ('member-admin@example.com', true, false, false, false, false, false),
            ('site-select@example.com', false, true, true, false, false, false),
            ('hugo-admin@example.com', false, true, false, true, false, false);

SET ROLE kansa;

INSERT INTO People (legal_name, email, membership, member_number)
     VALUES ('Admin', 'admin@example.com', 'NonMember', NULL),
            ('Member Admin', 'member-admin@example.com', 'NonMember', NULL),
            ('Site Selection', 'site-select@example.com', 'NonMember', NULL),
            ('Hugo Admin', 'hugo-admin@example.com', 'NonMember', NULL),
            ('First Member', 'member@example.com', 'FirstWorldcon', 2),
            ('Fan Parent', 'family@example.com', 'Adult', 3),
            ('Fan Child', 'family@example.com', 'Child', 4),
            ('Fan YoungAdult', 'family@example.com', 'YoungAdult', 5),
            ('Fan Supporter', 'supporter@example.com', 'Supporter', 6),
            ('Dupe Supporter', 'supporter@example.com', 'Supporter', 7),
            ('Fan Trader', 'trader@example.com', 'Exhibitor', 8),
            ('Fan Helper', 'helper@example.com', 'Helper', 9),
            ('Fan Nominator', 'nominator@example.com', 'HugoNominator', NULL);

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
