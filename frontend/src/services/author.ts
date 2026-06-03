export interface AuthorInfo {
  name: string
  title: string
  email: string
  telegram: string
  location: string
  bio: string
  roles: string[]
}

const FALLBACK: AuthorInfo = {
  name: 'Trung Kien Dang',
  title: 'Web Developer',
  email: 'kiendangtrung@live.com',
  telegram: '@trungkiendang',
  location: 'Hanoi, Vietnam',
  bio: 'There is no universal language, framework, or technology that is the universal best choice for every software development problem.',
  roles: ['Web Developer', 'Frontend-developer', 'Backend-developer'],
}

export async function fetchAuthorInfo(): Promise<AuthorInfo> {
  try {
    const res = await fetch('https://api.github.com/users/trungkiendang')
    const user = await res.json()
    const name = user.name || FALLBACK.name
    return {
      name,
      title: user.bio?.split('.')[0] || FALLBACK.title,
      email: FALLBACK.email,
      telegram: '@trungkiendang',
      location: user.location || FALLBACK.location,
      bio: user.bio || FALLBACK.bio,
      roles: FALLBACK.roles,
    }
  } catch {
    return FALLBACK
  }
}
