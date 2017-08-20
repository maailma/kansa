# kansa-timeline

Tool for generating a timeline of membership progression. To use, generate the
input data with:

```sql
copy (
select add_date,add_ms,up_date,up_ms
from (
    select subject,timestamp::date as add_date,
        coalesce(parameters->>'membership',parameters#>>'{new_members,0,membership}') as add_ms
    from kansa.log where description = 'Add new person'
) as add
left join (
    select subject,timestamp::date as up_date,
        coalesce(parameters->>'membership',parameters#>>'{upgrades,0,membership}') as up_ms
    from kansa.log where description like 'Upgrade %'
) as up
using (subject)
where add_ms != 'NonMember' or up_ms is not null
order by add_date,up_date
) to '/tmp/join-dates.csv' with (format csv, header);
```

Then generate the output data with:
```
node index.js /tmp/join-dates.csv
```
