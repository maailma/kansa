SET ROLE kansa;

CREATE TYPE MembershipStatus AS ENUM (
    'NonMember', 'Exhibitor', 'Helper', 'Supporter', 'KidInTow',
    'Child', 'Youth', 'FirstWorldcon', 'Adult'
);
