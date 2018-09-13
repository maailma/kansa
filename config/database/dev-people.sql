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
            ('Expired Login', 'expired@example.com', 'NonMember', NULL),
            ('First Member', 'member@example.com', 'FirstWorldcon', 2),
            ('Fan Parent', 'family@example.com', 'Adult', 3),
            ('Fan Child', 'family@example.com', 'Child', 4),
            ('Fan Youth', 'family@example.com', 'Youth', 5),
            ('Fan Supporter', 'supporter@example.com', 'Supporter', 6),
            ('Dupe Supporter', 'supporter@example.com', 'Supporter', 7),
            ('Fan Trader', 'trader@example.com', 'Exhibitor', 8),
            ('Fan Helper', 'helper@example.com', 'Helper', 9),
            ('Fan Nominator', 'nominator@example.com', 'HugoNominator', NULL);

INSERT INTO Keys (email, key, expires)
     VALUES ('admin@example.com', 'key', NULL),
            ('member-admin@example.com', 'key', NULL),
            ('site-select@example.com', 'key', NULL),
            ('hugo-admin@example.com', 'key', NULL),
            ('expired@example.com', 'key', '2017-08-13'),
            ('family@example.com', 'key', NULL),
            ('member@example.com', 'key', NULL),
            ('nominator@example.com', 'key', NULL),
            ('trader@example.com', 'key', NULL),
            ('helper@example.com', 'key', NULL),
            ('supporter@example.com', 'key', NULL);

ALTER SEQUENCE member_number_seq RESTART WITH 42;

-- The admin & expired users are used by integration tests, and are expected
-- to initially have these key values.
CREATE FUNCTION reset_test_users() RETURNS void AS $$
BEGIN
  UPDATE keys SET key='key', expires=NULL WHERE email='admin@example.com';
  UPDATE keys SET key='key', expires=NULL WHERE email='site-select@example.com';
  UPDATE keys SET key='key', expires='2017-08-13' WHERE email='expired@example.com';
END;
$$ LANGUAGE plpgsql;
