import FingerprintJS from '@fingerprintjs/fingerprintjs';

export const getDeviceId = async (): Promise<string> => {
  // Check localStorage first for a persistent ID
  const storedId = localStorage.getItem('baby_shower_device_id');
  if (storedId) return storedId;

  // Otherwise generate one
  const fpPromise = FingerprintJS.load();
  const fp = await fpPromise;
  const result = await fp.get();
  
  const deviceId = result.visitorId;
  localStorage.setItem('baby_shower_device_id', deviceId);
  
  return deviceId;
};

export const hasVoted = (): boolean => {
  return !!localStorage.getItem('baby_shower_has_voted');
};

export const setVoted = () => {
  localStorage.setItem('baby_shower_has_voted', 'true');
};
