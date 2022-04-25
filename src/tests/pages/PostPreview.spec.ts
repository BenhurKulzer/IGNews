import { render, screen } from '@testing-library/react'
import { mocked } from 'ts-jest/utils'

import { getPrismicClient } from '../../services/prismic'
import Post, { getStaticProps } from '../../pages/posts/preview/[slug]'
import { useSession } from 'next-auth/client'
import { useRouter } from 'next/router'

const post = {
  slug: 'fake-slug-post',
  title: 'fake-title-post',
  content: '<p>fake-excerpt-post<p/>',
  updatedAt: 'March, 10'
}

jest.mock('next-auth/client');
jest.mock('next/router');
jest.mock('../../services/prismic');

describe('Post preview page', () => {
  it('renders correctly', () => {
    const useSessionMocked = mocked(useSession);

    useSessionMocked.mockReturnValueOnce([null, false]);

    render(<Post post={post} />)

    expect(screen.getByText('fake-title-post')).toBeInTheDocument()
    expect(screen.getByText('Post Excerpt')).toBeInTheDocument()
    expect(screen.getByText('Wanna continue reading?')).toBeInTheDocument()
  })

  it('rediredcts user to full post when user is subscribed', async () => {
    const useSessionMocked = mocked(useSession);
    const useRouterMocked = mocked(useRouter);
    const pushMocked = jest.fn();

    useSessionMocked.mockReturnValueOnce([
      { activeSubscription: 'fake-active-subscription' },
      false
    ] as any);

    useRouterMocked.mockReturnValueOnce({
      push: pushMocked,
    } as any);

    render(<Post post={post} />);

    expect(pushMocked).toHaveBeenCalledWith('posts/my-new-post');
  })
  
  it('load initial data', async () => {
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

    const response = await getStaticProps({ params: { slug: 'my-new-post' } });

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