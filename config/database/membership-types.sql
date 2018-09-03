SET ROLE kansa;

INSERT INTO membership_types (
 membership, allow_lookup,  badge, daypass_available, hugo_nominator, member, wsfs_member) VALUES
('NonMember',        true,  false,             false,          false,  false,       false),
('HugoNominator',    true,  false,             false,           true,  false,       false),
('Exhibitor',        true,   true,             false,          false,   true,       false),
('Helper',           true,   true,             false,          false,   true,       false),
('Voter',            true,  false,             false,          false,  false,       false),
('Backer',           true,  false,             false,          false,  false,       false),
('Friend',           true,  false,             false,          false,  false,       false),
('Supporter',        true,  false,             false,           true,   true,        true),
('Infant',          false,   true,             false,          false,   true,       false),
('Child',           false,   true,              true,          false,   true,       false),
('YoungAdult',       true,   true,              true,           true,   true,        true),
('FirstWorldcon',    true,   true,             false,           true,   true,        true),
('Adult',            true,   true,              true,           true,   true,        true);
