select coalesce(json_agg(row_to_json(buildings_result)), '[]'::json)
from (
  select
      building_id::text as building_id,
      name,
      abbreviation
  from buildings
  order by abbreviation
) as buildings_result;
