module.exports = {
  sls_telemetry_value_parent: 'INSERT INTO sls_telemetry_value_parent(filename, imported, rloi_id, station, region, start_timestamp, end_timestamp, parameter, qualifier, units, post_process, subtract, por_max_value, station_type, percentile_5) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING telemetry_value_parent_id',
  deleteCurrentFwis: 'delete from u_flood.current_fwis;',
  refreshFloodWarningsMview: 'refresh materialized view u_flood.current_flood_warning_alert_mview with data;',
  updateTimestamp: 'update u_flood.current_load_timestamp set load_timestamp = $1 where id = 1;'
}
