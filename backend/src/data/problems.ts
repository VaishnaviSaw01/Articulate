export type ProblemSeed = {
  slug: string;
  title: string;
  category: "Arrays" | "Trees" | "Graphs" | "Dynamic Programming";
  difficulty: "Easy" | "Medium" | "Hard";
  prompt: string;
  constraints: string;
  examples: { input: string; output: string; explanation?: string }[];
  starterCode: { javascript: string; python: string };
};

export const PROBLEMS: ProblemSeed[] = [
  // ---------------- Arrays ----------------
  {
    slug: "two-sum",
    title: "Two Sum",
    category: "Arrays",
    difficulty: "Easy",
    prompt:
      "Given an array of integers `nums` and an integer `target`, return the indices of the two numbers such that they add up to `target`. You may assume each input has exactly one solution, and you may not use the same element twice.",
    constraints: "2 <= nums.length <= 10^4, -10^9 <= nums[i] <= 10^9",
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "nums[0] + nums[1] == 9" },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
    ],
    starterCode: {
      javascript: "function twoSum(nums, target) {\n  // your code here\n}\n",
      python: "def two_sum(nums, target):\n    # your code here\n    pass\n",
    },
  },
  {
    slug: "best-time-to-buy-sell-stock",
    title: "Best Time to Buy and Sell Stock",
    category: "Arrays",
    difficulty: "Easy",
    prompt:
      "You are given an array `prices` where `prices[i]` is the price of a stock on day i. You want to maximize profit by choosing a single day to buy and a different, later day to sell. Return the maximum profit, or 0 if no profit is possible.",
    constraints: "1 <= prices.length <= 10^5, 0 <= prices[i] <= 10^4",
    examples: [
      { input: "prices = [7,1,5,3,6,4]", output: "5", explanation: "Buy on day 2 (price 1), sell on day 5 (price 6)" },
      { input: "prices = [7,6,4,3,1]", output: "0" },
    ],
    starterCode: {
      javascript: "function maxProfit(prices) {\n  // your code here\n}\n",
      python: "def max_profit(prices):\n    # your code here\n    pass\n",
    },
  },
  {
    slug: "maximum-subarray",
    title: "Maximum Subarray",
    category: "Arrays",
    difficulty: "Medium",
    prompt:
      "Given an integer array `nums`, find the contiguous subarray (containing at least one number) that has the largest sum, and return its sum.",
    constraints: "1 <= nums.length <= 10^5, -10^4 <= nums[i] <= 10^4",
    examples: [
      { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "[4,-1,2,1] has the largest sum = 6" },
    ],
    starterCode: {
      javascript: "function maxSubArray(nums) {\n  // your code here\n}\n",
      python: "def max_sub_array(nums):\n    # your code here\n    pass\n",
    },
  },
  {
    slug: "product-of-array-except-self",
    title: "Product of Array Except Self",
    category: "Arrays",
    difficulty: "Medium",
    prompt:
      "Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all elements of `nums` except `nums[i]`, without using division, in O(n) time.",
    constraints: "2 <= nums.length <= 10^5, product fits in a 32-bit integer",
    examples: [{ input: "nums = [1,2,3,4]", output: "[24,12,8,6]" }],
    starterCode: {
      javascript: "function productExceptSelf(nums) {\n  // your code here\n}\n",
      python: "def product_except_self(nums):\n    # your code here\n    pass\n",
    },
  },
  {
    slug: "longest-substring-without-repeating",
    title: "Longest Substring Without Repeating Characters",
    category: "Arrays",
    difficulty: "Medium",
    prompt:
      "Given a string `s`, find the length of the longest substring without repeating characters.",
    constraints: "0 <= s.length <= 5 * 10^4",
    examples: [
      { input: 's = "abcabcbb"', output: "3", explanation: 'The answer is "abc"' },
      { input: 's = "bbbbb"', output: "1" },
    ],
    starterCode: {
      javascript: "function lengthOfLongestSubstring(s) {\n  // your code here\n}\n",
      python: "def length_of_longest_substring(s):\n    # your code here\n    pass\n",
    },
  },

  // ---------------- Trees ----------------
  {
    slug: "binary-tree-level-order-traversal",
    title: "Binary Tree Level Order Traversal",
    category: "Trees",
    difficulty: "Medium",
    prompt:
      "Given the root of a binary tree, return the level order traversal of its nodes' values (i.e., from left to right, level by level) as an array of arrays.",
    constraints: "0 <= number of nodes <= 2000",
    examples: [{ input: "root = [3,9,20,null,null,15,7]", output: "[[3],[9,20],[15,7]]" }],
    starterCode: {
      javascript:
        "// Node shape: { val, left, right }\nfunction levelOrder(root) {\n  // your code here\n}\n",
      python:
        "# Node shape: TreeNode(val, left, right)\ndef level_order(root):\n    # your code here\n    pass\n",
    },
  },
  {
    slug: "validate-binary-search-tree",
    title: "Validate Binary Search Tree",
    category: "Trees",
    difficulty: "Medium",
    prompt:
      "Given the root of a binary tree, determine if it is a valid binary search tree (BST). A valid BST has, for every node, all left-subtree values strictly less than the node's value and all right-subtree values strictly greater.",
    constraints: "1 <= number of nodes <= 10^4",
    examples: [
      { input: "root = [2,1,3]", output: "true" },
      { input: "root = [5,1,4,null,null,3,6]", output: "false", explanation: "4 is less than 5 but is in the right subtree" },
    ],
    starterCode: {
      javascript: "function isValidBST(root) {\n  // your code here\n}\n",
      python: "def is_valid_bst(root):\n    # your code here\n    pass\n",
    },
  },
  {
    slug: "lowest-common-ancestor-bst",
    title: "Lowest Common Ancestor of a BST",
    category: "Trees",
    difficulty: "Medium",
    prompt:
      "Given a binary search tree, find the lowest common ancestor (LCA) of two given nodes `p` and `q` in the BST.",
    constraints: "2 <= number of nodes <= 10^5, all values are unique",
    examples: [{ input: "root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8", output: "6" }],
    starterCode: {
      javascript: "function lowestCommonAncestor(root, p, q) {\n  // your code here\n}\n",
      python: "def lowest_common_ancestor(root, p, q):\n    # your code here\n    pass\n",
    },
  },
  {
    slug: "maximum-depth-binary-tree",
    title: "Maximum Depth of Binary Tree",
    category: "Trees",
    difficulty: "Easy",
    prompt: "Given the root of a binary tree, return its maximum depth (the number of nodes along the longest path from the root down to the farthest leaf).",
    constraints: "0 <= number of nodes <= 10^4",
    examples: [{ input: "root = [3,9,20,null,null,15,7]", output: "3" }],
    starterCode: {
      javascript: "function maxDepth(root) {\n  // your code here\n}\n",
      python: "def max_depth(root):\n    # your code here\n    pass\n",
    },
  },

  // ---------------- Graphs ----------------
  {
    slug: "number-of-islands",
    title: "Number of Islands",
    category: "Graphs",
    difficulty: "Medium",
    prompt:
      "Given an `m x n` 2D binary grid `grid` which represents a map of '1's (land) and '0's (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.",
    constraints: "1 <= m, n <= 300",
    examples: [
      {
        input: '[["1","1","0","0"],["1","1","0","0"],["0","0","1","0"],["0","0","0","1"]]',
        output: "3",
      },
    ],
    starterCode: {
      javascript: "function numIslands(grid) {\n  // your code here\n}\n",
      python: "def num_islands(grid):\n    # your code here\n    pass\n",
    },
  },
  {
    slug: "course-schedule",
    title: "Course Schedule",
    category: "Graphs",
    difficulty: "Medium",
    prompt:
      "There are `numCourses` courses labeled 0 to numCourses-1. Given an array `prerequisites` where `prerequisites[i] = [a, b]` means you must take course b before course a, return true if you can finish all courses (i.e., the prerequisite graph has no cycle).",
    constraints: "1 <= numCourses <= 2000",
    examples: [
      { input: "numCourses = 2, prerequisites = [[1,0]]", output: "true" },
      { input: "numCourses = 2, prerequisites = [[1,0],[0,1]]", output: "false", explanation: "Cycle: 0 -> 1 -> 0" },
    ],
    starterCode: {
      javascript: "function canFinish(numCourses, prerequisites) {\n  // your code here\n}\n",
      python: "def can_finish(num_courses, prerequisites):\n    # your code here\n    pass\n",
    },
  },
  {
    slug: "clone-graph",
    title: "Clone Graph",
    category: "Graphs",
    difficulty: "Medium",
    prompt:
      "Given a reference to a node in a connected undirected graph, return a deep copy (clone) of the graph. Each node has a value and a list of neighbors.",
    constraints: "0 <= number of nodes <= 100, no repeated edges or self-loops",
    examples: [{ input: "adjList = [[2,4],[1,3],[2,4],[1,3]]", output: "[[2,4],[1,3],[2,4],[1,3]]" }],
    starterCode: {
      javascript:
        "// Node shape: { val, neighbors: [] }\nfunction cloneGraph(node) {\n  // your code here\n}\n",
      python:
        "# Node shape: Node(val, neighbors)\ndef clone_graph(node):\n    # your code here\n    pass\n",
    },
  },

  // ---------------- Dynamic Programming ----------------
  {
    slug: "climbing-stairs",
    title: "Climbing Stairs",
    category: "Dynamic Programming",
    difficulty: "Easy",
    prompt:
      "You are climbing a staircase with `n` steps. Each time you can climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    constraints: "1 <= n <= 45",
    examples: [
      { input: "n = 2", output: "2" },
      { input: "n = 3", output: "3" },
    ],
    starterCode: {
      javascript: "function climbStairs(n) {\n  // your code here\n}\n",
      python: "def climb_stairs(n):\n    # your code here\n    pass\n",
    },
  },
  {
    slug: "coin-change",
    title: "Coin Change",
    category: "Dynamic Programming",
    difficulty: "Medium",
    prompt:
      "Given an array of coin denominations `coins` and an integer `amount`, return the fewest number of coins needed to make up that amount. If it cannot be made, return -1.",
    constraints: "1 <= coins.length <= 12, 0 <= amount <= 10^4",
    examples: [
      { input: "coins = [1,2,5], amount = 11", output: "3", explanation: "11 = 5 + 5 + 1" },
      { input: "coins = [2], amount = 3", output: "-1" },
    ],
    starterCode: {
      javascript: "function coinChange(coins, amount) {\n  // your code here\n}\n",
      python: "def coin_change(coins, amount):\n    # your code here\n    pass\n",
    },
  },
  {
    slug: "longest-increasing-subsequence",
    title: "Longest Increasing Subsequence",
    category: "Dynamic Programming",
    difficulty: "Medium",
    prompt:
      "Given an integer array `nums`, return the length of the longest strictly increasing subsequence.",
    constraints: "1 <= nums.length <= 2500",
    examples: [{ input: "nums = [10,9,2,5,3,7,101,18]", output: "4", explanation: "[2,3,7,101]" }],
    starterCode: {
      javascript: "function lengthOfLIS(nums) {\n  // your code here\n}\n",
      python: "def length_of_lis(nums):\n    # your code here\n    pass\n",
    },
  },
];
