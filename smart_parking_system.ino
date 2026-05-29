// ================= SMART PARKING SYSTEM =====================
// RFID ENTRY (Gate UP only) -at entry time
// IR ENTRY SENSOR (Gate DOWN) -at entry time
// IR EXIT SENSOR (Gate OPEN only) -at exit time
// Ultrasonic SENSOR (Gate DOWN only) -at exit time

#include <SPI.h>
#include <MFRC522.h>
#include <Servo.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// ---------- PIN SETUP ----------
#define IR_ENTRY_PIN A0   // Entry IR
#define IR_EXIT_PIN  A1   // Exit IR → Gate OPEN

#define TRIG_PIN     4    // Ultrasonic Trigger
#define ECHO_PIN     5    // Ultrasonic Echo

#define BUZZER_PIN   8

#define SERVO1_PIN   6   // Entry Gate
#define SERVO2_PIN   7   // Exit Gate

#define SS_PIN       10  // RFID
#define RST_PIN      9

const int TOTAL_SPOTS = 4;
int freeSpots = TOTAL_SPOTS;

bool exitGateOpen = false;  // <--- FLAG: exit gate open

// ---------- OBJECTS ----------
Servo entryGate;
Servo exitGate;
MFRC522 mfrc522(SS_PIN, RST_PIN);
LiquidCrystal_I2C lcd(0x27, 16, 2);

// Authorized UID
byte authorized1[] = {0x87, 0xF3, 0x6A, 0x05};

// ---------- FUNCTIONS ----------
void beep() {
  digitalWrite(BUZZER_PIN, LOW);
  delay(150);
  digitalWrite(BUZZER_PIN, HIGH);
}

void updateLCD() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("PARK SENSE");
  lcd.setCursor(0, 1);
  lcd.print("Slots: ");
  lcd.print(freeSpots);
  lcd.print("/");
  lcd.print(TOTAL_SPOTS);
}

void gateUpEntry() { entryGate.write(90); }
void gateDownEntry() { entryGate.write(0); }

void gateUpExit() {
  exitGate.write(90);
  exitGateOpen = true;
}

void gateDownExit() {
  exitGate.write(0);
  exitGateOpen = false;
}

// ---------- Ultrasonic Distance ----------
long getDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);

  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH);
  long distance = duration * 0.034 / 2;

  return distance;
}

bool isUIDEqual(byte *u1, byte *u2) {
  for (int i = 0; i < 4; i++)
    if (u1[i] != u2[i]) return false;
  return true;
}

// ================= SETUP =================
void setup() {
  Serial.begin(115200);

  SPI.begin();
  mfrc522.PCD_Init();

  pinMode(IR_ENTRY_PIN, INPUT_PULLUP);
  pinMode(IR_EXIT_PIN, INPUT_PULLUP);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, HIGH);

  entryGate.attach(SERVO1_PIN);
  entryGate.write(0);

  exitGate.attach(SERVO2_PIN);
  exitGate.write(0);

  lcd.init();
  lcd.backlight();
  updateLCD();
}

// ================= LOOP =================
void loop() {

  // ===== ENTRY — RFID (Gate UP only) =====
  if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {

    bool authorized = false;

    if (mfrc522.uid.size == 4) {
      if (isUIDEqual(mfrc522.uid.uidByte, authorized1)) authorized = true;
    }

    if (authorized && freeSpots > 0) {
      freeSpots--;
      updateLCD();
      beep();
      gateUpEntry();
    } else {
      beep();
    }

    mfrc522.PICC_HaltA();
  }

  // ===== ENTRY IR SENSOR → Gate Down =====
  if (digitalRead(IR_ENTRY_PIN) == LOW) {
    delay(50);
    if (digitalRead(IR_ENTRY_PIN) == LOW) {
      gateDownEntry();
      while (digitalRead(IR_ENTRY_PIN) == LOW);
      delay(200);
    }
  }

  // =======================================================
  // =============== EXIT SIDE (UPDATED) ===================
  // =======================================================

  // ===== EXIT IR SENSOR → Gate OPEN only =====
  if (digitalRead(IR_EXIT_PIN) == LOW) {

    delay(50);
    if (digitalRead(IR_EXIT_PIN) == LOW) {

      Serial.println("Exit IR detected → Gate OPEN");
      beep();
      gateUpExit();          // only open

      // NO SLOT UPDATE HERE

      while (digitalRead(IR_EXIT_PIN) == LOW);
      delay(200);
    }
  }

  // ===== Ultrasonic → Gate DOWN only =====
  if (exitGateOpen) {                // check gate is already open
    long distance = getDistance();

    if (distance > 2 && distance < 30) {  // car passing detected

      Serial.println("Ultrasonic → Gate CLOSE");
      gateDownExit();                // close gate

      freeSpots++;                   // slot update here ONLY
      if (freeSpots > TOTAL_SPOTS) freeSpots = TOTAL_SPOTS;

      updateLCD();
      delay(300);
    }
  }

  delay(20);
}