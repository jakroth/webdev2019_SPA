PRAGMA foreign_keys = ON;
.header on
.mode column

DROP TABLE User;


CREATE TABLE Users (
userID					CHAR(8)	NOT NULL, 
username 				CHAR(20), 
password 				CHAR(20),
title 					CHAR(4),
fName 					CHAR(20),
lName 					CHAR(20),
email		 			CHAR(20),
userType					CHAR(20),
PRIMARY KEY (UserID)
);










