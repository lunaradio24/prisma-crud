import express from 'express';
import { PrismaClient } from '@prisma/client';
import { prisma } from '../utils/prisma/index.js';

const router = express.Router(); // express.Router()를 이용해 라우터를 생성합니다.

/**  게시글 작성 API  **/
router.post('/posts', async (req, res, next) => {
  const { title, content, password } = req.body;
  const post = await prisma.posts.create({
    data: { title, content, password },
  });

  return res.status(201).json({ data: post });
});

/**  게시글 목록 조회 API  **/
router.get('/posts', async (req, res, next) => {
  const posts = await prisma.posts.findMany({
    // 게시글 내용과 비밀번호가 포함되지 않도록 구현해야 한다.
    select: {
      postId: true,
      title: true,
      content: false, // 이 부분은 작성하지 않아도 저절로 false 처리
      password: false, // 이 부분은 작성하지 않아도 저절로 false 처리
      createdAt: true,
      updatedAt: true,
    }
  });

  return res.status(200).json({ data: posts });
});

/**  게시글 상세 조회 API  **/
router.get('/posts/:postId', async (req, res, next) => {
  const { postId } = req.params;
  const post = await prisma.posts.findFirst({
    where: { postId: +postId }, // +postId === Number(postId)
    select: {
      postId: true,
      title: true,
      createdAt: true,
      updatedAt: true,
    }
  });

  return res.status(200).json({ data: post });
});

/**  게시글 수정 API  **/
router.put('/posts/:postId', async (req, res, next) => {
  const {postId} = req.params;
  const { title, content, password } = req.body;
  const post = await prisma.posts.findUnique({
    where: { postId: +postId }, // +postId === Number(postId)
  });
  if (!post) {
    return res.status(404).json({errorMessage: "게시글이 존재하지 않습니다."});
  }
  if (password !== post.password) {
    return res.status(401).json({errorMessage: "비밀번호가 일치하지 않습니다."});
  }

  await prisma.posts.update({
    data: {title, content},
    where: {
      postId: +postId,
      password: password
    }
  })

  return res.status(200).json({data: "게시글 수정이 완료되었습니다."});
});


/**  게시글 삭제 API  **/
router.delete('/posts/:postId', async (req, res, next) => {
  const {postId} = req.params;
  const { password } = req.body;
  const post = await prisma.posts.findUnique({
    where: { postId: +postId }, // +postId === Number(postId)
  });
  if (!post) {
    return res.status(404).json({errorMessage: "게시글이 존재하지 않습니다."});
  }
  if (password !== post.password) {
    return res.status(401).json({errorMessage: "비밀번호가 일치하지 않습니다."});
  }

  await prisma.posts.delete({
    where: {
      postId: +postId,
      password: password
    }
  })

  return res.status(200).json({data: "게시글 삭제가 완료되었습니다."});
});


export default router;
