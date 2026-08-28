conn software_project/softpass

|------------------------------------------|
|			ADMIN				 |
|------------------------------------------|

		   [ PLAYER ]

DROP TABLE PLAYER;

CREATE TABLE PLAYER
(
player_id INT UNIQUE,
player_name VARCHAR2(30),
player_dob DATE,
player_age INT,
player_height INT,
player_weight INT,
player_gender VARCHAR2(10),
player_kitno INT,
player_salary NUMBER(15,2),
player_fit VARCHAR2(15),
player_injury_date DATE,
player_recovery_time INT
);

-- show table

SELECT * FROM PLAYER;
SELECT player_id, player_name, player_age, player_gender, player_height, player_weight, player_kitno, player_salary, player_fit FROM PLAYER;

-- create player

INSERT INTO PLAYER (player_name, player_dob, player_height, player_weight, player_gender, player_kitno, player_salary, player_fit, player_injury_date, player_recovery_time) VALUES
('Syem Aziz', TO_DATE('09/11/2000', 'DD/MM/YYYY'), 170, 90, 'Male', 23, 1000, 'Available', TO_DATE('09/11/2021', 'DD/MM/YYYY'), 3);

INSERT INTO PLAYER (player_name, player_dob, player_height, player_weight, player_gender, player_kitno, player_salary, player_fit, player_injury_date, player_recovery_time) VALUES
('Moudud Hasan', TO_DATE('14/10/2000', 'DD/MM/YYYY'), 160, 58, 'Male', 24, 1100, 'Injured', TO_DATE('09/09/2022', 'DD/MM/YYYY'), 7);

INSERT INTO PLAYER (player_name, player_dob, player_height, player_weight, player_gender, player_kitno, player_salary, player_fit, player_injury_date, player_recovery_time) VALUES
('Aashnan Rahman', TO_DATE('25/09/1999', 'DD/MM/YYYY'), 173, 55, 'Male', 04, 1500, 'Available', TO_DATE('05/07/2022', 'DD/MM/YYYY'), 2);


-- clear table

DELETE FROM PLAYER ;


-- formatting

column player_id format a10
column player_name format a10
column player_dob format a10
column player_age format a10
column player_height format a10
column player_weight format a10
column player_gender format a10
column player_kitno format a10
column player_salary format a10
column player_fit format a10
column player_injury_date format a10


-- calculate age

UPDATE player SET player_age = (CURRENT_DATE - player_dob)/365;


-- INJURY UPDATE (inefficient, max(0,val) )

UPDATE player SET player_fit = 'Available',   player_recovery_time = 0 WHERE ( (CURRENT_DATE - player_injury_date)/30 >= player_recovery_time)  ;

UPDATE player SET player_recovery_time = (CURRENT_DATE - player_injury_date)/30 WHERE player_fit = 'Injured';


-- update Anything

UPDATE player SET coln_name = value;


-- create a match

DROP TABLE MATCH;

CREATE TABLE MATCH
(
match_ID INT PRIMARY KEY,
match_date DATE,
match_opponent VARCHAR2(10),
match_venue VARCHAR2(10),
match_result VARCHAR2(10),
match_hs INT,
match_as INT,
match_update INT
);

SELECT * FROM MATCH;

-- pre match setup
INSERT INTO MATCH (match_ID,match_date, match_opponent, match_venue, match_update) VALUES (1,TO_DATE('16/10/2022', 'DD/MM/YYYY'), 'IMPULSE FC', 'Home', 0); 

INSERT INTO MATCH (match_ID,match_date, match_opponent, match_venue, match_update) VALUES (2,TO_DATE('5/10/2022', 'DD/MM/YYYY'), 'Arsenal FC', 'Away', 0); 


	[followed by]

CREATE TABLE matchday_XI
(
match_id INT PRIMARY KEY,
FOREIGN KEY match_fk REFERENCES match (match_id)
);



-- match done but not updated

SELECT * FROM match WHERE (CURRENT_DATE >= match_date) AND match_update = 0;

-- post match setup

UPDATE match SET match_hs = 3 , match_as = 1 , match_update = 1 WHERE (CURRENT_DATE >= match_date);

** DECLARE
	h_s INT;
	a_s INT;
BEGIN
	SELECT match_hs INTO h_s FROM match;
	SELECT match_as INTO a_s FROM match;
	
	IF(h_s > a_s)
		UPDATE match SET match_result = 'WIN' WHERE match_update = 1;
	ELSIF(h_s < a_s)
		UPDATE match SET match_result = 'DEFEAT' WHERE match_update = 1;
	ELSE
		UPDATE match SET match_result = 'DRAW' WHERE match_update = 1;
	END IF;
END;
/**

UPDATE match SET match_result = 'WIN' WHERE (match_hs > match_as) AND match_update = 1;
UPDATE match SET match_result = 'DEFEAT' WHERE (match_hs < match_as) AND match_update = 1;
UPDATE match SET match_result = 'DRAW' WHERE (match_hs = match_as) AND match_update = 1;



		



|------------------------------------------|
|			MANAGER		       |
|------------------------------------------|

		   [ GAME ]
