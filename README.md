# Node-Virtual-Device
A basic virtual device simulator capable of generating multiple TCP sockets and generating random data from a device configuration file for a client to connect to and read from. 

## Requirements
Node.js v.16+ 
PM2 or some other process manager if you want to run the server for an extended period of time.

## Configuration
Edit the devices.js file to create "devices" with various data types. Future "drivers" will be added allowing more complex device simulation like specific PLCs using protocols like OPC UA, S7, and more. 

As of right now, basic TCP with JSON and CSV outputs are available built-in.

## Run
Using node.js simply type "node server" in the app directory.

## Connect
You can use telnet to test easily enough:

telnet (host) (port)

Or connect to the host and port using a SCADA or MES system like Inductive Automation's Ignition Platform.
