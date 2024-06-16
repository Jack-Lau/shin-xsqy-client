type UserStorageData = {
  xAuthToken: string;
}

export function setData<T extends keyof UserStorageData>(key: T, value: UserStorageData[T]) {
  cc.sys.localStorage.setItem(key, JSON.stringify(value))
}

export function getData<T extends keyof UserStorageData>(key: T): UserStorageData[T] | null {
  const str = cc.sys.localStorage.getItem(key);
  if (str) {
    return JSON.parse(str)
  } else {
    return null
  }
}