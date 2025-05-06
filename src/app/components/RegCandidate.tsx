import React, { useMemo, useState } from 'react'
import { FaTimes } from 'react-icons/fa'
import { globalActions } from '../store/globalSlices'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../utils/interfaces'
import {
  fetchAllCandidates,
  fetchPollDetails,
  getProvider,
  registerCandidate,
} from '../services/blockchain.service'
import { useWallet } from '@solana/wallet-adapter-react'
import { toast } from 'react-toastify'

const RegCandidate = ({
  pollId,
  pollAddress,
}: {
  pollId: number
  pollAddress: string
}) => {
  const { publicKey, sendTransaction, signTransaction } = useWallet()
  const [candidateName, setCandidateName] = useState<string>('')

  const dispatch = useDispatch()
  const { setRegModal } = globalActions
  const { regModal } = useSelector((states: RootState) => states.globalStates)

  const program = useMemo(
    () => getProvider(publicKey, signTransaction, sendTransaction),
    [publicKey, signTransaction, sendTransaction]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!program || !publicKey || !candidateName) return

    await toast.promise(
      new Promise<void>(async (resolve, reject) => {
        try {
          const tx = await registerCandidate(
            program!,
            publicKey!,
            pollId,
            candidateName
          )

          setCandidateName('')
          dispatch(setRegModal('scale-0'))

          await fetchPollDetails(program, pollAddress)
          await fetchAllCandidates(program, pollAddress)

          console.log(tx)
          resolve(tx as any)
        } catch (error) {
          console.error('Transaction failed:', error)
          reject(error)
        }
      }),
      {
        pending: 'Approve transaction...',
        success: 'Transaction successful 👌',
        error: 'Encountered error 🤯',
      }
    )
  }

  return (
    <div
      className={`fixed top-0 left-0 w-screen h-screen flex items-center justify-center
      bg-black bg-opacity-50 transform z-[3000] transition-transform duration-300 ${regModal}`}
    >
      <div className="bg-white shadow-lg shadow-slate-900 rounded-xl w-11/12 md:w-2/5 h-7/12 p-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="flex flex-row justify-between items-center">
            <p className="block text-sm font-semibold text-gray-700">
              Candidate Name
            </p>
            <button
              type="button"
              className="border-0 bg-transparent focus:outline-none"
              onClick={() => dispatch(setRegModal('scale-0'))}
            >
              <FaTimes className="text-gray-400" />
            </button>
          </div>

          <div>
            <input
              type="text"
              id="description"
              placeholder="Briefly describe the purpose of this poll..."
              required
              className="mt-2 block w-full py-3 px-4 border border-gray-300
              rounded-lg shadow-sm focus:ring-2 focus:ring-black
              focus:outline-none bg-gray-100 text-gray-800"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
            />
          </div>

          <div className="flex justify-center w-full">
            <button
              type="submit"
              disabled={!program || !publicKey}
              className="bg-black text-white font-bold py-3 px-6 rounded-lg
              hover:bg-gray-900 transition duration-200 w-full disabled:bg-opacity-70"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegCandidate
