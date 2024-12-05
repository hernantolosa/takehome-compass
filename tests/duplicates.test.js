import { calculateMatchScore, getAccuracyLevel, findDuplicatesOptimized } from '../index.js';

const mockContacts = [
  {
    id: '923',
    firstName: 'I',
    lastName: 'W',
    email: '',
    zipCode: '',
    address: '1175 Elementum street.',
    emailKey: '',
    nameKey: `${'i'}${'w'}`,
    zipCodeKey: '',
    addressKey: '1175 elementum street.',
  },
  {
    id: '940',
    firstName: 'I',
    lastName: 'W',
    email: '',
    zipCode: '',
    address: '6944 Ipsum. Avenue',
    emailKey: '',
    nameKey: `${'i'}${'w'}`,
    zipCodeKey: '',
    addressKey: '6944 ipsum. avenue',
  },
  {
    id: '935',
    firstName: 'J',
    lastName: 'F',
    email: '',
    zipCode: '',
    address: 'Semper street.',
    emailKey: '',
    nameKey: `${'j'}${'f'}`,
    zipCodeKey: '',
    addressKey: 'semper street.',
  },
  {
    id: '944',
    firstName: 'A',
    lastName: 'S',
    email: '',
    zipCode: '',
    address: 'Semper street.',
    emailKey: '',
    nameKey: `${'a'}${'s'}`,
    zipCodeKey: '',
    addressKey: 'semper street.',
  },
  {
    id: '996',
    firstName: 'Chase',
    lastName: 'Randall',
    email: 'a@yahoo.org',
    zipCode: '56674',
    address: '',
    emailKey: 'a@yahoo.org',
    nameKey: `${'chase'}${'randall'}`,
    zipCodeKey: '56674',
    addressKey: '',
  },
  {
    id: '496',
    firstName: 'Chase',
    lastName: 'Randall',
    email: 'a@yahoo.org',
    zipCode: '56674',
    address: '1416 Tortor Av.',
    emailKey: 'a@yahoo.org',
    nameKey: `${'chase'}${'randall'}`,
    zipCodeKey: '56674',
    addressKey: '1416 tortor av.',
  },
];

const expectedResults = [
    { contactIdSource: '923', contactIdMatch: '940', accuracy: 'Medium' },
    { contactIdSource: '935', contactIdMatch: '944', accuracy: 'Low' },
    { contactIdSource: '996', contactIdMatch: '496', accuracy: 'High' },
  ];
  
test('findDuplicatesOptimized should return correct matches and accuracy levels', () => {
  const duplicates = findDuplicatesOptimized(mockContacts);

  expect(duplicates).toEqual(expectedResults);
});

test('calculateMatchScore should calculate correct scores', () => {
  const contact1 = mockContacts.find((c) => c.id === '496');
  const contact2 = mockContacts.find((c) => c.id === '996');

  const score = calculateMatchScore(contact1, contact2);

  expect(score).toBeGreaterThanOrEqual(6);
});

test('getAccuracyLevel should determine correct levels', () => {
  const scores = [
    { score: 7, expected: 'High' },
    { score: 4, expected: 'Medium' },
    { score: 2, expected: 'Low' },
    { score: 0, expected: 'None' },
  ];

  scores.forEach(({ score, expected }) => {
    const accuracy = getAccuracyLevel(score);
    expect(accuracy).toBe(expected);
  });
});
