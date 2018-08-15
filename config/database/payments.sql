SET ROLE kansa;

INSERT INTO stripe_keys (name, type, key) VALUES
('default','pk_test','pk_test_LoOP8RB3gIlLkSYIyM9G6skn'),
('default','pk_live','pk_live_vSEBxO9ddioYqCGvhVsog4pb'),
('siteselect','pk_test','pk_test_k9X10O1qQoKXD3MHNQU8KvNw'),
('siteselect','pk_live','pk_live_xZn2VzgwkIauumoxFI0W3IlF');

INSERT INTO payment_fields (key, label, required, type) VALUES
('invoice'           , 'Invoice number'     , null , 'string')  ,
('comments'          , 'Comments'           , null , 'string')  ,
('token'             , 'Token'              , true , 'string')  ,
('day1'              , 'Wednesday'          , null , 'boolean') ,
('day2'              , 'Thursday'           , null , 'boolean') ,
('day3'              , 'Friday'             , null , 'boolean') ,
('day4'              , 'Saturday'           , null , 'boolean') ,
('day5'              , 'Sunday'             , null , 'boolean') ,
('legal_name'        , 'Legal name'         , true , 'string')  ,
('email'             , 'Email'              , true , 'string')  ,
('public_first_name' , 'Public first name'  , null , 'string')  ,
('public_last_name'  , 'Public last name'   , null , 'string')  ,
('city'              , 'City'               , null , 'string')  ,
('state'             , 'State/province'     , null , 'string')  ,
('country'           , 'Country'            , null , 'string')  ,
('membership'        , 'Membership type'    , null , 'string')  ,
('paper_pubs'        , 'Paper publications' , null , 'object')  ,
('pp_name'           , 'Paper pubs name'    , true , 'string')  ,
('pp_address'        , 'Paper pubs address' , true , 'string')  ,
('pp_country'        , 'Paper pubs country' , true , 'string')  ,
('count'             , 'Number of items'    , null , 'string')  ,
('sponsor'           , 'Sponsor name'       , true , 'string');

UPDATE payment_fields SET generated = true WHERE key IN ('token');

INSERT INTO payment_categories (key, label, allow_create_account, custom_email, fields) VALUES
-- ('daypass'     , 'Day pass'           , true , null , ARRAY['day1','day2','day3','day4','day5','legal_name','email','public_first_name','public_last_name','city','state','country','invoice','comments']),
('new_member'  , 'New membership'     , true , true , ARRAY['membership','legal_name','email','public_first_name','public_last_name','city','state','country','paper_pubs','invoice','comments']),
('paper_pubs'  , 'Paper publications' , null , true , ARRAY['pp_name','pp_address','pp_country','invoice','comments']),
('exhibits'    , 'Exhibits'           , null , null , ARRAY['count','invoice','comments']),
('trips_tours' , 'Trips and Tours'    , null , null , ARRAY['invoice','comments']),
('upgrade'     , 'Upgrade membership' , null , true , ARRAY['membership','paper_pubs','invoice','comments']),
('ads'         , 'Ads'                , null , null , ARRAY['invoice','comments']),
('party'       , 'Party space'        , null , null , ARRAY['invoice','comments']),
('staff'       , 'Staff shirt'        , null , null , ARRAY['invoice','comments']);

INSERT INTO payment_categories (key, label, account, listed, fields, description) VALUES
--('siteselect', 'Advance Supporting Membership Fee for the 2019 Worldcon', 'siteselect', true, ARRAY['token'], '<p>You (or someone else you pay for) will receive a <b>voting token</b> to be entered on the site selection ballot as proof of payment, which will allow you to submit a vote for where the 77th Worldcon will be held in 2019. You can vote in advance by postal mail or in person at Worldcon 75. Your ballot will NOT be counted unless you provide this proof of payment of the Advance Supporting Membership Fee for the 2019 Worldcon. You will receive your voting token via email.</p><p><b>Worldcon Site Selection Ballot</b>: <a href="http://www.worldcon.fi/wsfs/site-selection/" target="_blank">Click here</a> to find a printable copy of the Worldcon Site Selection ballot to download.</p>'),
('sponsor', 'Sponsorship', null, true, ARRAY['sponsor','invoice','comments'], 'The problem with travelling is the waiting. The long wait for a space elevator capsule or dragon caravan (or for that programme item you really want to see) can get quite dull. Why not sponsor a craft lounge to help con-goers pass the time? Or sponsor a bench, and give weary convention members somewhere to put their feet up when they have spent too long wandering around the halls.');

INSERT INTO payment_types (category, key, amount, label, sort_index) VALUES
--('daypass'     , 'daypass-Adult'      , null  , 'Adult (from NZD $375/day)'                     , 1)  ,
--('daypass'     , 'daypass-Youth'      , null  , 'Youth (from NZD $225/day)'                     , 2)  ,
--('daypass'     , 'daypass-Child'      , null  , 'Child (from NZD $105/day)'                     , 3)  ,
('new_member'  , 'Unwaged'            , 22500 , 'Unwaged (NZ residents only)'                   , 1)  ,
('new_member'  , 'Adult'              , 37500 , 'Adult'                                         , 2)  ,
('new_member'  , 'YoungAdult'         , 22500 , 'Young Adult'                                   , 3)  ,
('new_member'  , 'Child'              , 10500 , 'Child'                                         , 4)  ,
('new_member'  , 'KidInTow'           , 0     , 'Kid-in-tow'                                    , 5)  ,
('new_member'  , 'Supporter'          , 7500  , 'Supporting'                                    , 6)  ,
('paper_pubs'  , 'paper_pubs'         , 0     , 'Paper publications'                            , 1)  ,
('exhibits'    , 'art-board'          , 3000  , 'Art show board'                                , 1)  ,
('exhibits'    , 'art-halftable'      , 1500  , 'Art show half-table'                           , 2)  ,
('exhibits'    , 'art-printshop'      , 50    , 'Print shop'                                    , 3)  ,
('exhibits'    , 'art-digital'        , 2000  , 'Digital Gallery'                               , 4)  ,
('exhibits'    , 'book-table'         , 500   , 'Book sales table'                              , 10) ,
('exhibits'    , 'ca-member-wed'      , 500   , 'Creators Alley table (member) - Wednesday'     , 20) ,
('exhibits'    , 'ca-member-thu'      , 1000  , 'Creators Alley table (member) - Thursday'      , 21) ,
('exhibits'    , 'ca-member-fri'      , 1000  , 'Creators Alley table (member) - Friday'        , 22) ,
('exhibits'    , 'ca-member-sat'      , 2500  , 'Creators Alley table (member) - Saturday'      , 23) ,
('exhibits'    , 'ca-member-sun'      , 1500  , 'Creators Alley table (member) - Sunday'        , 24) ,
('exhibits'    , 'ca-nonmember-wed'   , 2500  , 'Creators Alley table (non-member) - Wednesday' , 30) ,
('exhibits'    , 'ca-nonmember-thu'   , 3000  , 'Creators Alley table (non-member) - Thursday'  , 31) ,
('exhibits'    , 'ca-nonmember-fri'   , 3000  , 'Creators Alley table (non-member) - Friday'    , 32) ,
('exhibits'    , 'ca-nonmember-sat'   , 4500  , 'Creators Alley table (non-member) - Saturday'  , 33) ,
('exhibits'    , 'ca-nonmember-sun'   , 3500  , 'Creators Alley table (non-member) - Sunday'    , 34) ,
('exhibits'    , 'ca-electricity'     , 2000  , 'Creators Alley table - electricity'            , 40) ,
('exhibits'    , 'ca-exhibitor'       , 2000  , 'Creators Alley extra exhibitor pass'           , 41) ,
('exhibits'    , 'fan-electricity'    , 2000  , 'Fan table - electricity'                       , 42) ,
('trips_tours' , 'solar-system-tour'  , 1700  , 'Solar System Tour Bike Rental'                 , 1)  ,
('trips_tours' , 'nuclear-plant-tour' , 3500  , 'Nuclear Power Plant Tour'                      , 2)  ,
('trips_tours' , 'suomenlinna-tour'   , 1100  , 'Suomenlinna Tour'                              , 3)  ,
('trips_tours' , 'beertram-tour'      , 3000  , 'Spårakoff Ride (Thursday)'                     , 4)  ,
('upgrade'     , 'upgrade'            , null  , 'Upgrade'                                       , 1)  ,
('ads'         , 'ad-invoice'         , null  , 'Ad invoice'                                    , 1)  ,
('party'       , 'party-space'        , null  , 'Party payment'                                 , 1)  ,
('staff'       , 'staff-shirt'        , null  , 'Staff shirt'                                   , 1);

INSERT INTO payment_types (category, key, amount, label, description, sort_index) VALUES
('sponsor', 'bench', 6000, 'Sponsored bench plaque', '<p>Following the deeply ingrained Fannish Tradition of two previous Worldcons, we are offering the opportunity to sponsor benches in the Exhibits Hall. Give weary convention members somewhere to put their feet up when they have spent too long wandering around the halls. Memorialise a friend, advertise your convention, or hide the secret of your success in a coded message.</p><p>Each bench comes with a plaque to hold a message with four lines of text, 20-25 characters per line. After the convention you get to keep the plaque (but not the bench).</p><p>For queries, contact <a href="mailto:exhibits@worldcon.fi">exhibits@worldcon.fi</a>. If your sponsorship is received in time, it will be acknowledged on the Worldcon75 website and in the programme book.</p>', 1),
('sponsor', 'lounge', 50000, 'Craft lounge', '<p>The problem with travelling is the waiting. The long wait for a space elevator capsule or dragon caravan (or for that programme item you really want to see) can get quite dull. Why not sponsor a craft lounge to help con-goers pass the time? Origami, knitting, coloring pages, paper constructions—we have a long list of suggestions and we’re open to other ideas too.</p><p>Craft space sponsorships include a sign and a set of themed posters for you to keep. You’re also welcome to keep any left-over craft supplies if you would like (or we will donate them to a good cause).</p><p>For queries, contact <a href="mailto:exhibits@worldcon.fi">exhibits@worldcon.fi</a>. If your sponsorship is received in time, it will be acknowledged on the Worldcon75 website and in the programme book.</p>', 2);

--INSERT INTO daypass_amounts VALUES
--('Adult',37500,37500,37500,37500,37500),
--('Youth',22500,22500,22500,22500,22500),
--('Child',10500,10500,10500,10500,10500);
