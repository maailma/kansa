SET ROLE kansa;

INSERT INTO membership_types (
 membership, allow_lookup,  badge, daypass_available, hugo_nominator, member_number, wsfs_member) VALUES
('NonMember',        true,  false,             false,          false,         false,       false),
('HugoNominator',    true,  false,             false,           true,         false,       false),
('Exhibitor',        true,   true,             false,          false,          true,       false),
('Helper',           true,   true,             false,          false,          true,       false),
('Supporter',        true,  false,             false,           true,          true,        true),
('KidInTow',        false,   true,             false,          false,          true,       false),
('Child',           false,   true,              true,          false,          true,       false),
('Youth',            true,   true,              true,           true,          true,        true),
('FirstWorldcon',    true,   true,             false,           true,          true,        true),
('Adult',            true,   true,              true,           true,          true,        true);
