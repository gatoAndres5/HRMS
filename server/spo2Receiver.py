import socket
import json
import pymongo

myclient = pymongo.MongoClient("mongodb://localhost:27017")
mydb=myclient['spo2']
mycol=mydb["readings"]

UDP_IP = "172.31.16.125"
UDP_PORT = 8181

sock = socket.socket(socket.AF_INET, # Internet
                     socket.SOCK_DGRAM) # UDP
sock.bind((UDP_IP, UDP_PORT))

while True:
    data, addr = sock.recvfrom(1024) # buffer size is 1024 bytes
    print("received message: %s" % data.decode())
    j = json.loads(data)
    if (j['hrvalid'] and j['spo2valid']):
        print('inserting')
        mycol.insert_one(j)

