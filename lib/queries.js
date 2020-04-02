module.exports = {
  slsTelemetryValueParent: 'INSERT INTO sls_telemetry_value_parent(filename, imported, rloi_id, station, region, start_timestamp, end_timestamp, parameter, qualifier, units, post_process, subtract, por_max_value, station_type, percentile_5) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING telemetry_value_parent_id',
  deleteCurrentFwis: 'delete from u_flood.fwis;',
  refreshFloodWarningsMview: 'refresh materialized view u_flood.fwa_mview with data;',
  updateTimestamp: 'update u_flood.current_load_timestamp set load_timestamp = $1 where id = 1;',
  deleteStations: 'Truncate table u_flood.telemetry_context;',
  refreshStationMviews: 'REFRESH MATERIALIZED VIEW u_flood.telemetry_context_mview with data; REFRESH MATERIALIZED VIEW u_flood.station_split_mview with data; REFRESH MATERIALIZED VIEW u_flood.stations_overview_mview WITH DATA; REFRESH MATERIALIZED VIEW u_flood.impact_mview WITH DATA;',
  deleteOldTelemetry: 'DELETE FROM u_flood.sls_telemetry_value_parent WHERE imported < to_timestamp(EXTRACT(EPOCH FROM now()) - 432000) at time zone \'utc\';',
  upsertFfoiMax: 'INSERT INTO u_flood.ffoi_max (telemetry_id, value, value_date, filename, updated_date) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (telemetry_id) DO UPDATE SET value = $2, value_date = $3, filename = $4, updated_date = $5'
}
