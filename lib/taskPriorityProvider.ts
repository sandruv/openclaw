export enum TaskPriorityType {
  Critical = 1,
  High = 2,
  Medium = 3,
  Low = 4,
  None = 5
}

export class TaskPriorityProvider {
  private static priorityMap = new Map([
    [1, { id: 1, name: 'Critical', weight: 4 }],
    [2, { id: 2, name: 'High', weight: 3 }],
    [3, { id: 3, name: 'Medium', weight: 2 }],
    [4, { id: 4, name: 'Low', weight: 1 }],
    [5, { id: 5, name: 'None', weight: 0 }]
  ])

  static getPriorityById(id: number) {
    return this.priorityMap.get(id) || { id: 5, name: 'None', weight: 0 }
  }

  static getPriorityByName(name: string) {
    for (const [id, priority] of this.priorityMap) {
      if (priority.name.toLowerCase() === name.toLowerCase()) {
        return priority
      }
    }
    return { id: 5, name: 'None', weight: 0 }
  }

  static getAllPriorities() {
    return Array.from(this.priorityMap.values())
  }

  static getPriorityWeight(priorityId: number): number {
    return this.getPriorityById(priorityId).weight
  }

  static comparePriorities(priorityIdA: number, priorityIdB: number): number {
    const weightA = this.getPriorityWeight(priorityIdA)
    const weightB = this.getPriorityWeight(priorityIdB)
    return weightB - weightA // Higher weight = higher priority
  }
}
