#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Fri Sep  2 00:47:46 2022

@author: sanz
"""
import csv
import os.path
from csv import writer
import datetime 
import pandas as pd
  
  
def create_player():
    file_exists = os.path.exists('Player.csv')
    if(file_exists):
        # List
        f_name="Mantis"
        l_name="Po"
        bday="14/09/1990"
        gender="Male"
        weight=68
        height=184
        kit_no=29
        ID=76
        availablity="Yes"
        List=[ID,f_name,l_name,bday,gender,height,weight,kit_no,availablity]
        # Open our existing CSV file in append mode
        # Create a file object for this file
        with open('Player.csv', 'a') as file:
            # Pass this file object to csv.writer()
            # and get a writer object
            writer = csv.writer(file)
            # Pass the list as an argument into
            # the writerow()
            writer.writerow(List)
            #Close the file object
            file.close() 
    else:
        with open('Player.csv', 'w', newline='') as file:
           writer = csv.writer(file)
           writer.writerow(["Player ID","First Name", "Last Name","Date of Birth", "Gender", "Height","Weight","Kit No","Availability"])
    
    

#create_player()



  

def create_owner():
    file_exists = os.path.exists('Owner.csv')
    if(file_exists):
        # List
        List=[5453,'William Jerry',43345.00]
        # Open our existing CSV file in append mode
        # Create a file object for this file
        with open('Owner.csv', 'a') as file:
            # Pass this file object to csv.writer()
            # and get a writer object
            writer = csv.writer(file)
            # Pass the list as an argument into
            # the writerow()
            writer.writerow(List)
            #Close the file object
            file.close() 
    else:
        with open('Owner.csv', 'w', newline='') as file:
           writer = csv.writer(file)
           writer.writerow(["Owner ID","Name","Revenue"])
    
#create_owner()

def physio(ID,present):
    df = pd.read_csv('Player.csv', index_col='Player ID')
    # Set cell value at row 'c' and column 'Age'
    df.loc[ID, 'Availability'] = present
    # Write DataFrame to CSV file
    df.to_csv('Player.csv')
physio(76,"Yes")

"""
import csv
import os.path
from csv import writer
  
def create_player():
    file_exists = os.path.exists('Player.csv')
    if(file_exists):
        # List
        List=[5453,'William','Arif','01-02-1996','Male','172 inches','75 KG','63','No']
        # Open our existing CSV file in append mode
        # Create a file object for this file
        with open('Player.csv', 'a') as f_object:
            # Pass this file object to csv.writer()
            # and get a writer object
            writer_object = writer(f_object)
            # Pass the list as an argument into
            # the writerow()
            writer_object.writerow(List)
            #Close the file object
            f_object.close() 
    else:
        with open('Player.csv', 'w', newline='') as file:
           writer = csv.writer(file)
           writer.writerow(["Player ID","First Name", "Last Name","Date of Birth", "Gender", "Height","Weight","Kit No","Availability"])

create_player()
"""
   
                