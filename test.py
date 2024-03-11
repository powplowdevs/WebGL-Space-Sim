import os
import time

def shutdown_after_hours(hours):
    seconds = hours * 3600
    time.sleep(seconds)
    os.system("shutdown /s /t 1")

if __name__ == "__main__":
    try:
        hours = float(input("Enter the number of hours after which you want to shutdown: "))
        shutdown_after_hours(hours)
    except ValueError:
        print("Invalid input. Please enter a valid number of hours.")
