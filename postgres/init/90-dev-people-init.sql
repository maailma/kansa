INSERT INTO admin.Admins (email, member_admin, member_list, siteselection, hugo_admin, raami_admin, admin_admin)
     VALUES ('admin@example.com', true, true, true, true, true, true),
            ('member-admin@example.com', true, false, false, false, false, false),
            ('site-select@example.com', false, false, true, false, false, false),
            ('hugo-admin@example.com', false, true, false, true, false, false);

SET ROLE kansa;

INSERT INTO People (legal_name, email, membership, member_number, can_hugo_nominate, can_hugo_vote)
     VALUES ('Admin', 'admin@example.com', 'NonMember', NULL, false, false),
            ('Member Admin', 'member-admin@example.com', 'NonMember', NULL, false, false),
            ('Site Selection', 'site-select@example.com', 'NonMember', NULL, false, false),
            ('Hugo Admin', 'hugo-admin@example.com', 'NonMember', NULL, false, false),
            ('First Member', 'member@example.com', 'FirstWorldcon', 21, true, true),
            ('Fan Parent', 'family@example.com', 'Adult', 37, true, true),
            ('Fan Child', 'family@example.com', 'Child', 45, false, false),
            ('Fan Youth', 'family@example.com', 'Youth', 59, true, true),
            ('Fan Supporter', 'supporter@example.com', 'Supporter', 68, true, true),
            ('Dupe Supporter', 'supporter@example.com', 'Supporter', 76, false, false),
            ('Fan Trader', 'trader@example.com', 'Exhibitor', 84, false, false),
            ('Fan Helper', 'helper@example.com', 'Helper', 92, false, false),
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
