import fs from "fs";
import csv from "csv-parser";

const AccuracyLevel = {
  None: "None",
  Low: "Low",
  Medium: "Medium",
  High: "High",
};

const SCORING = {
  email: 3,
  name: 3,
  zipCode: 2,
  address: 1,
};

const MAX_SCORE = Object.values(SCORING).reduce((sum, val) => sum + val, 0);

const normalize = (str) => (str || "").trim().toLowerCase();

export const getAccuracyLevel = (score) => {
  const percentage = score / MAX_SCORE;

  if (percentage >= 0.66) return AccuracyLevel.High;
  if (percentage >= 0.33) return AccuracyLevel.Medium;
  if (percentage > 0) return AccuracyLevel.Low;
  return AccuracyLevel.None;
};

export const calculateMatchScore = (contact, match) => {
  let score = 0;

  if (contact.emailKey && contact.emailKey === match.emailKey) {
    score += SCORING.email;
  }

  if (contact.nameKey && contact.nameKey === match.nameKey) {
    score += SCORING.name;
  }

  if (contact.zipCodeKey && contact.zipCodeKey === match.zipCodeKey) {
    score += SCORING.zipCode;
  }

  if (contact.addressKey && contact.addressKey === match.addressKey) {
    score += SCORING.address;
  }

  return score;
};

const buildHashMaps = (contacts) => {
  const hashMaps = {
    email: new Map(),
    name: new Map(),
    zipCode: new Map(),
    address: new Map(),
  };

  contacts.forEach((contact) => {
    const { emailKey, nameKey, zipCodeKey, addressKey } = contact;

    if (emailKey)
      hashMaps.email.set(emailKey, (hashMaps.email.get(emailKey) || []).concat(contact));
    if (nameKey)
      hashMaps.name.set(nameKey, (hashMaps.name.get(nameKey) || []).concat(contact));
    if (zipCodeKey)
      hashMaps.zipCode.set(zipCodeKey, (hashMaps.zipCode.get(zipCodeKey) || []).concat(contact));
    if (addressKey)
      hashMaps.address.set(addressKey, (hashMaps.address.get(addressKey) || []).concat(contact));
  });

  return hashMaps;
};

const getMatchedContacts = (contact, hashMaps) => {
  const matchedContacts = new Set();

  const emailMatches = hashMaps.email.get(contact.emailKey) || [];
  const nameMatches = hashMaps.name.get(contact.nameKey) || [];
  const zipCodeMatches = hashMaps.zipCode.get(contact.zipCodeKey) || [];
  const addressMatches = hashMaps.address.get(contact.addressKey) || [];

  [...emailMatches, ...nameMatches, ...zipCodeMatches, ...addressMatches].forEach((match) => {
    if (match.id !== contact.id) matchedContacts.add(match);
  });

  return matchedContacts;
};

export const findDuplicatesOptimized = (contacts) => {
  const results = [];
  const hashMaps = buildHashMaps(contacts);
  const processedPairs = new Set();

  contacts.forEach((contact) => {
    const matchedContacts = getMatchedContacts(contact, hashMaps);

    matchedContacts.forEach((match) => {
      const pairKey = [contact.id, match.id].sort().join('-');
      if (processedPairs.has(pairKey)) return;
      processedPairs.add(pairKey);

      const score = calculateMatchScore(contact, match);
      const accuracy = getAccuracyLevel(score);

      if (accuracy !== AccuracyLevel.None) {
        results.push({
          contactIdSource: contact.id,
          contactIdMatch: match.id,
          accuracy,
        });
      }
    });
  });

  return results;
};

const readCSV = async (filePath) => {
  const contacts = [];

  try {
    const stream = fs.createReadStream(filePath).pipe(csv());

    for await (const row of stream) {
      contacts.push(row);
    }

    return contacts;
  } catch (error) {
    console.error("Error reading CSV:", error);
    throw error;
  }
};

const processCSV = async (filePath) => {
  try {
    const contacts = await readCSV(filePath);
    const formattedContacts = contacts.map((row, index) => ({
      id: row["contactID"] || `row-${index}`,
      firstName: row["name"] || "",
      lastName: row["name1"] || "",
      email: row["email"] || "",
      zipCode: row["postalZip"] || "",
      address: row["address"] || "",
      emailKey: normalize(row["email"]),
      nameKey: `${normalize(row["name"])}${normalize(row["name1"])}`,
      zipCodeKey: normalize(row["postalZip"]),
      addressKey: normalize(row["address"]),
    }));

    const duplicates = findDuplicatesOptimized(formattedContacts);
    console.log(duplicates);
  } catch (error) {
    console.error("Error processing CSV:", error);
  }
};

const filePath = "./Code Assessment - Find Duplicates Input - SampleCodecsv.csv";
processCSV(filePath);


