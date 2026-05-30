select coalesce(json_agg(row_to_json(professors_result)), '[]'::json)
from (
  select
      p.professor_id::text as professor_id,
      p.first_name,
      p.last_name,
      p.gender,

      max(case when cm.type = 'email' then cm.value end) as email,
      max(case when cm.type = 'phone' then cm.value end) as phone,
      max(case when cm.type = 'office_phone' then cm.value end) as office_phone,
      max(case when cm.type = 'website' then cm.value end) as website,

      string_agg(distinct d.name, ', ') as departments,
      string_agg(distinct pos.title, ', ') as positions,

      b.abbreviation as building,
      b.name as building_name,
      r.room_number,
      r.floor

  from professors p
  left join contact_methods cm
      on p.professor_id = cm.professor_id
  left join professor_departments pd
      on p.professor_id = pd.professor_id
  left join departments d
      on pd.department_id = d.department_id
  left join professor_positions pp
      on p.professor_id = pp.professor_id
  left join positions pos
      on pp.position_id = pos.position_id
  left join office_assignments oa
      on p.professor_id = oa.professor_id
  left join rooms r
      on oa.room_id = r.room_id
  left join buildings b
      on r.building_id = b.building_id

  group by
      p.professor_id,
      p.first_name,
      p.last_name,
      p.gender,
      b.abbreviation,
      b.name,
      r.room_number,
      r.floor

  order by p.last_name, p.first_name
) as professors_result;
