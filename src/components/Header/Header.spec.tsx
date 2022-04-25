import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/router'; 
import { useSession } from 'next-auth/client';
import { Header } from '.';

jest.mock('next/router', () => {
  return {
    useRouter() {
      return {
        asPath: '/'
      }
    }
  }
})


jest.mock('next-auth/client', () => {
  return {
    useSession() {
      return [null, false];
    }
  }
})
describe('Active link component', () => {
  it('renders correctly', () => {
    render(
      <Header />
    )

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Posts')).toBeInTheDocument()
  })
})