select coalesce(json_agg(row_to_json(rooms_result)), '[]'::json)
from (
  select
      r.room_id::text as room_id,
      r.room_number,
      r.floor,
      b.building_id::text as building_id,
      b.name as building_name,
      b.abbreviation as building
  from rooms r
  left join buildings b
      on r.building_id = b.building_id
  order by b.abbreviation, r.room_number
) as rooms_result;
