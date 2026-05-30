select coalesce(json_agg(row_to_json(office_hours_result)), '[]'::json)
from (
  select
      oh.office_hour_id::text as office_hour_id,
      oh.professor_id::text as professor_id,
      s.name as semester_name,
      s.term,
      s.year,
      oh.day_of_week,
      oh.start_time,
      oh.end_time
  from office_hours oh
  left join semesters s
      on oh.semester_id = s.semester_id
  where oh.professor_id = :'professor_id'
  order by
      s.year,
      s.term,
      oh.day_of_week,
      oh.start_time
) as office_hours_result;
