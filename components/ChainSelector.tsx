import { useContext, useEffect, useMemo, useState, useCallback } from 'react'

import { useRegisterActions, Action } from 'kbar'
import Select, { OnChangeValue } from 'react-select'

import { EthereumContext } from 'context/ethereumContext'
import { SettingsContext, Setting } from 'context/settingsContext'

import { toKeyIndex } from 'util/string'

import { Icon } from 'components/ui'

const ChainSelector = () => {
  const { settingsLoaded, getSetting, setSetting } = useContext(SettingsContext)
  const { forks, selectedFork, onForkChange } = useContext(EthereumContext)

  const [forkValue, setForkValue] = useState()
  const [actions, setActions] = useState<Action[]>([])

  const forkOptions = useMemo(
    () => forks.map((fork) => ({ value: fork, label: fork })),
    [forks],
  )

  const defaultForkOption = useMemo(
    () => forkOptions.find((fork) => fork.value === selectedFork),
    [forkOptions, selectedFork],
  )

  const handleForkChange = useCallback(
    (option: OnChangeValue<any, any>) => {
      setForkValue(option)
      onForkChange(option.value)
      setSetting(Setting.VmFork, option)
    },
    [onForkChange, setSetting],
  )

  useEffect(() => {
    if (defaultForkOption) {
      handleForkChange(getSetting(Setting.VmFork) || defaultForkOption)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsLoaded, defaultForkOption])

  useEffect(() => {
    const forkIds: string[] = []

    const forkActions = forkOptions.map(
      (option: OnChangeValue<any, any>, index) => {
        const keyId = toKeyIndex('fork', index)
        forkIds.push(keyId)

        return {
          id: keyId,
          name: option.label,
          shortcut: [],
          keywords: option.label,
          section: '',
          perform: () => handleForkChange(option),
          parent: 'fork',
        }
      },
    )

    if (forkIds.length > 0) {
      setActions([
        ...forkActions,
        {
          id: 'fork',
          name: 'Select hardfork…',
          shortcut: ['f'],
          keywords: 'fork network evm',
          section: 'Preferences',
          children: forkIds,
        },
      ])
    }
  }, [forkOptions, handleForkChange])

  useRegisterActions(actions, [actions])

  return (
    <div className="flex justify-end items-center rounded">
      {forks.length > 0 && (
        <div className="flex items-center mr-4">
          <Icon name="git-branch-line" className="text-indigo-500 mr-2" />

          <Select
            onChange={handleForkChange}
            options={forkOptions}
            value={forkValue}
            isSearchable={false}
            classNamePrefix="select"
          />
        </div>
      )}
    </div>
  )
}

export default ChainSelector
