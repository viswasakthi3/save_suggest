<template>
    <div class="max-w-2xl mx-auto mt-8 p-4 bg-gray-50 rounded-xl shadow-lg">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">Comments</h2>
  
  <!-- Add Comment Section -->
  <form @submit.prevent="handleSubmit" class="mb-6 flex items-center space-x-3">
    <input
      v-model="newComment"
      type="text"
      placeholder="Add a comment..."
      class="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
    />
    <button
      type="submit"
      class="post-button"
    >
      <Send size="18" class="text-white" />
      <span>Post</span>
    </button>
  </form>
  
      <!-- Comments List -->
      <div v-for="comment in comments" :key="comment.id" class="p-4 mb-4 bg-white shadow-md rounded-lg">
        <div class="flex items-start space-x-4">
          <img :src="comment.avatar" :alt="comment.author" class="w-12 h-12 rounded-full" />
          <div class="flex-grow">
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-gray-800">{{ comment.author }}</h3>
              <span class="text-sm text-gray-500">{{ comment.timestamp }}</span>
            </div>
            <p class="mt-2 text-gray-600">{{ comment.content }}</p>
            <div class="mt-4 flex items-center space-x-4">
              <!-- Like Button -->
              <button 
                @click="incrementLikes(comment)"
                class="flex items-center space-x-1 text-green-500 hover:text-green-600 transition duration-200 ease-in-out"
              >
                <ThumbsUp class="w-5 h-5" />
                <span class="ml-1">{{ comment.likes }}</span>
              </button>
              <!-- Dislike Button -->
              <button 
                @click="incrementDislikes(comment)"
                class="flex items-center space-x-1 text-red-500 hover:text-red-600 transition duration-200 ease-in-out"
              >
                <ThumbsDown class="w-5 h-5" />
                <span class="ml-1">{{ comment.dislikes }}</span>
              </button>
              <!-- Show Replies Button (Comment Icon for Toggle) -->
              <button 
                @click="toggleReplies(comment)"
                class="flex items-center space-x-1 text-blue-500 hover:text-blue-600 transition duration-200 ease-in-out"
              >
                <MessageSquare class="w-5 h-5" />
                <span class="ml-1">{{ comment.replies.length }} Replies</span>
              </button>
              <!-- Reply Button -->
              <button 
                @click="comment.showReplyInput = !comment.showReplyInput"
                class="flex items-center space-x-1 text-gray-500 hover:text-gray-600 transition duration-200 ease-in-out ml-4"
              >
                <Reply class="w-5 h-5" />
                <span class="ml-1">Reply</span>
              </button>
            </div>
  
            <!-- Replies Section -->
            <div v-if="comment.showReplies" class="mt-4 ml-8 border-l-2 border-gray-200 pl-4 space-y-4">
              <div v-for="reply in comment.replies" :key="reply.id" class="bg-gray-100 rounded-lg p-4">
                <div class="flex items-start space-x-3">
                  <img :src="reply.avatar" :alt="reply.author" class="w-8 h-8 rounded-full" />
                  <div class="flex-grow">
                    <div class="flex items-center justify-between">
                      <h4 class="font-semibold text-gray-700">{{ reply.author }}</h4>
                      <span class="text-xs text-gray-500">{{ reply.timestamp }}</span>
                    </div>
                    <p class="text-gray-600 text-sm">{{ reply.content }}</p>
                    <!-- Nested Reply Button for Each Reply -->
                    <button 
                      @click="reply.showReplyInput = !reply.showReplyInput"
                      class="flex items-center space-x-1 text-blue-500 hover:text-blue-600 mt-2 transition duration-200 ease-in-out ml-4"
                    >
                      <Reply class="w-4 h-4" />
                      <span class="ml-1">Reply</span>
                    </button>
                  </div>
                </div>
  <!-- Nested Reply Input Field (Only visible when 'Reply' button is clicked) -->
  <div v-if="reply.showReplyInput" class="mt-4 flex items-center space-x-3">
    <input
      v-model="reply.newReply"
      type="text"
      placeholder="Add a reply..."
      class="flex-grow p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
      @keyup.enter="addNestedReply(comment, reply)"
    />
    <button 
      @click="addNestedReply(comment, reply)"
      class="reply-button"
    >
      <Send size="16" class="text-white" />
      <span>Reply</span>
    </button>
  </div>
              </div>
            </div>
  
  <!-- Main Reply Input Field (Only visible when 'Reply' button is clicked) -->
  <div v-if="comment.showReplyInput" class="mt-4 flex items-center space-x-3">
    <input
      v-model="comment.newReply"
      type="text"
      placeholder="Add a reply..."
      class="flex-grow p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
      @keyup.enter="addReply(comment)"
    />
    <button 
      @click="addReply(comment)"
      class="reply-button"
    >
      <Send size="16" class="text-white" />
      <span>Reply</span>
    </button>
  </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { ThumbsUp, ThumbsDown, MessageSquare, Reply, Send } from 'lucide-vue-next'
  definePageMeta({
  colorMode: "light", // or 'dark'
});
  const sampleComments = [
    {
      id: 1,
      author: 'Alice Johnson',
      avatar: '/api/placeholder/32/32',
      content: "This is an amazing post! I love the insights you've shared.",
      likes: 16,
      dislikes: 3,
      liked: false,
      disliked: false,
      replies: [
        {
          id: 1,
          author: 'Bob Smith',
          avatar: '/api/placeholder/32/32',
          content: 'Thanks Alice! Glad you enjoyed it.',
          timestamp: '1 hour ago',
          newReply: '',
          showReplyInput: false,
        }
      ],
      timestamp: '2 hours ago',
      showReplies: false,
      newReply: '',
      showReplyInput: false
    }
  ]
  
  const comments = ref(sampleComments)
  const newComment = ref('')
  
  const handleSubmit = () => {
    if (newComment.value.trim() === '') return
  
    const comment = {
      id: comments.value.length + 1,
      author: 'Current User',
      avatar: '/api/placeholder/32/32',
      content: newComment.value,
      likes: 0,
      dislikes: 0,
      liked: false,
      disliked: false,
      replies: [],
      timestamp: 'Just now',
      showReplies: false,
      newReply: '',
      showReplyInput: false
    }
  
    comments.value.unshift(comment)
    newComment.value = ''
  }
  
  const incrementLikes = (comment) => {
    comment.likes++
  }
  
  const incrementDislikes = (comment) => {
    comment.dislikes++
  }
  
  const toggleReplies = (comment) => {
    comment.showReplies = !comment.showReplies
  }
  
  const addReply = (comment) => {
    if (comment.newReply.trim() === '') return
  
    const reply = {
      id: comment.replies.length + 1,
      author: 'Current User',
      avatar: '/api/placeholder/32/32',
      content: comment.newReply,
      timestamp: 'Just now',
      newReply: '',
      showReplyInput: false
    }
  
    comment.replies.push(reply)
    comment.newReply = ''
    comment.showReplyInput = false
  }
  
  const addNestedReply = (comment, reply) => {
    if (reply.newReply.trim() === '') return
  
    const nestedReply = {
      id: comment.replies.length + 1,
      author: 'Current User',
      avatar: '/api/placeholder/32/32',
      content: reply.newReply,
      timestamp: 'Just now',
      newReply: '',
      showReplyInput: false
    }
  
    comment.replies.push(nestedReply)
    reply.newReply = ''
    reply.showReplyInput = false
  }
  </script>
  
  <style scoped>
  .ml-1 {
    margin-left: 0.25rem;
  }
  .ml-4 {
    margin-left: 1rem;
  }

  
  </style>