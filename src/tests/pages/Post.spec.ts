import { render, screen } from '@testing-library/react'
import { mocked } from 'ts-jest/utils'

import { getPrismicClient } from '../../services/prismic'
import Post, { getServerSideProps } from '../../pages/posts/[slug]'
import { getSession } from 'next-auth/client'

const post = {
  slug: 'fake-slug-post',
  title: 'fake-title-post',
  content: '<p>fake-excerpt-post<p/>',
  updatedAt: 'March, 10'
}

jest.mock('next-auth/client');
jest.mock('../../services/prismic');

describe('Posts page', () => {
  it('renders correctly', () => {
    render(<Post post={post} />)

    expect(screen.getByText('fake-title-post')).toBeInTheDocument()
    expect(screen.getByText('Post Excerpt')).toBeInTheDocument()
  })

  it('rediredcts user if no subscription is found', async () => {
    const getSessionMocked = mocked(getSession);

    getSessionMocked.mockResolvedValueOnce(null);

    const response = await getServerSideProps({
      params: {
        slug: 'my-new-post'
      }
    } as any)

    expect(response).toEqual(
      expect.objectContaining({
        redirect: expect.objectContaining({
          destination: '/',
        })
      })
    )
  })
  
  it('load initial data', async () => {
    const getSessionMocked = mocked(getSession);
    const getPrismicClientMocked = mocked(getPrismicClient);

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [
            { type: 'heading', text: 'my new post' }
          ],
          content: [
            { type: 'paragraph', text: 'post excert' }
          ]
        },
        last_publication_date: '04-01-2021'
      })
    } as any);

    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: 'fake-active-subscription'
    } as any);

    const response = await getServerSideProps({
      params: {
        slug: 'my-new-post'
      }
    } as any)

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: 'my-new-post',
            title: 'My new post',
            content: '<p>Post content</p>',
            updated_at: '01 de abril de 2021'
          }
        }
      })
    )
  })
})