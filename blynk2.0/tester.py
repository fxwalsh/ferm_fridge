import BlynkLib
import random
import time
import datetime

BLYNK_AUTH = 'qFlNgzQdy3-uIykKwC2KoKYIwVX1NQBa'

# initialize Blynk
blynk = BlynkLib.Blynk(BLYNK_AUTH)

tmr_start_time = time.time()
target=18.0
state=["IDLE","HEATING","COOLING"]
# Register virtual pin handler
@blynk.on("V3")
def v3_write_handler(value):
    global target
    print('Current button value: {}'.format(value[0]))
    target=value
    

while True:
    blynk.run()

    t = time.time()
    if t - tmr_start_time > 1:
        print("1 sec elapsed, sending data to the server...")
        blynk.virtual_write(2, random.randint(15, 25))
        blynk.virtual_write(4, random.randint(15, 25))
        blynk.virtual_write(3, target)
        blynk.virtual_write(1, state[random.randint(0, 2)])
        blynk.virtual_write(1, state[random.randint(0, 2)])
        x = datetime.datetime.now()
        blynk.virtual_write(5, x.strftime("%H:%M"))


        tmr_start_time += 5