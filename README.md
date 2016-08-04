# facebook-koolaid
Simple application showcasing Facebook tech stack: React, Relay and GraphQL in a real world application
```
{
  posts {
    id,
    title,
    createdAt,
    creator {
   		email
    }
  }
}

mutation {
  createPost(post: {
    title: "test",
    content: "test2"
  }) {
    id,
    title,
    content,
    creator {
      id,
      email
    }
  }
}

mutation {
  updatePost(id: 1, post: {
    title: "a",
    content: "bbb"
  }) {
    id,
    title,
    content,
    creator {
      id,
      email
    }
  }
}

{
  comments {
    id,
    content,
		createdAt,
    creator {
      id, email
    },
    post {
      id, title
      creator {
        id, email
      }
    }
  }
}

mutation {
  createComment(comment: {
   	content: "somecomment",
    postId: 1
  }) {
		id,
    content,
		createdAt,
    creator {
      id, email
    },
    post {
      id, title, createdAt,
      creator {
        id, email
      }
    }
  }
}
```
