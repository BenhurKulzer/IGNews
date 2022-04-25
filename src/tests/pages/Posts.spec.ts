import { render, screen } from '@testing-library/react'
import { mocked } from 'ts-jest/utils'

import { getPrismicClient } from '../../services/prismic'
import Posts, { getStaticProps } from '../../pages/posts'

const posts = [
  {
    slug: 'fake-slug-post',
    title: 'fake-title-post',
    excerpt: 'fake-excerpt-post',
    updatedAt: 'March, 10'
  }
]

describe('Posts page', () => {
  it('renders correctly', () => {
    render(<Posts posts={posts} />)

    expect(screen.getByText('fake-title-post')).toBeInTheDocument()
  })

  it('load initial data', async () => {
    const getPrismicClientMocked = mocked(getPrismicClient)

    getPrismicClientMocked.mockReturnValueOnce({
      query: jest.fn().mockResolvedValueOnce({
        results: [
          {
            uid: 'my-new-post',
            data: {
              title: [{ type: 'heading', text: 'My new post' }],
              content: [{ type: 'paragraph', text: 'Post excerpt' }],
            },
            last_publication_date: '01-01-2022',
          }
        ]
      })
    } as any)

    const response = await getStaticProps({})

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          posts: [{
            slug: 'my-newpost',
            title: 'My new post',
            excerpt: 'Post excerpt',
            updatedAt: '01 de janeiro de 2022'
          }]
        }
      })
    )
  })
})