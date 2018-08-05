SET ROLE kansa;

INSERT INTO membership_types (
 membership,      badge, daypass_available, hugo_nominator, member_number, wsfs_member) VALUES
('NonMember',     false,             false,          false,         false,       false),
('HugoNominator', false,             false,           true,         false,       false),
('Exhibitor',      true,             false,          false,          true,       false),
('Helper',         true,             false,          false,          true,       false),
('Supporter',     false,             false,           true,          true,        true),
('KidInTow',       true,             false,          false,          true,       false),
('Child',          true,              true,          false,          true,       false),
('Youth',          true,              true,           true,          true,        true),
('FirstWorldcon',  true,             false,           true,          true,        true),
('Adult',          true,              true,           true,          true,        true);
