

CREATE TABLE user_logs(
 yyyy int2,
 mm   int2,
 dd   int2,
 user_id int8,
 h  int2,
 m  int2,
 event VARCHAR(20),

) USING COLUMNAR;

