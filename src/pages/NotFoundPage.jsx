import { motion } from 'motion/react';
import { Home, ArrowLeft, Dumbbell } from 'lucide-react';
import { Link } from 'react-router';
import { div } from 'motion/react-client';

export function NotFoundPage() {
  return (
    <div>
      <title>NotFound | FitPro GYM</title>
      <meta name='description' content="Oops! We can't find the page you are looking for. Don't let that stop your workout-head back to the FitPro GYM home page, view our gym classes or contact support for help Let's get you back on track!" />
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="text-center max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
              }}
              className="inline-block"
            >
              <Dumbbell className="size-24 text-red-500 mx-auto mb-4" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-white mb-4"
            >
              404
            </motion.h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <h2 className="text-white mb-4">Page Not Found</h2>
            <p className="text-zinc-400 mb-8">
              Looks like you've wandered into the wrong gym section. This page doesn't exist, but
              your fitness goals still do!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <button className="bg-red-500 text-white cursor-pointer hover:bg-red-600 gap-2 rounded-lg py-2 px-6 flex items-center">
                  <Home className="size-4" />
                  Back to Home
                </button>
              </Link>
              <button
                variant="outline"
                className="border-zinc-700 text-white cursor-pointer bg-zinc-800 hover:bg-zinc-700 gap-2 rounded-lg py-2 px-6 flex items-center"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="size-4" />
                Go Back
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-12 grid grid-cols-3 gap-4"
          >
            <Link to="/dashboard">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors"
              >
                <p className="text-zinc-400">My Dashboard</p>
              </motion.div>
            </Link>
            <Link to="/trainers">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors"
              >
                <p className="text-zinc-400">View Trainers</p>
              </motion.div>
            </Link>
            <Link to="/memberships">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors"
              >
                <p className="text-zinc-400">Memberships</p>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
